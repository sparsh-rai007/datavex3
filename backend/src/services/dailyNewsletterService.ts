import axios from "axios";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { pool } from "../db/connection";
import { fetchTrendingHeadlines } from "../utils/rssFetcher";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const CURATOR_MODEL = process.env.GROQ_NEWSLETTER_CURATOR_MODEL || "llama3-8b-8192";
const WRITER_MODEL =
  process.env.GROQ_NEWSLETTER_WRITER_MODEL ||
  process.env.GROQ_MODEL ||
  "llama-3.3-70b-versatile";

const JINA_READER_PREFIX = "https://r.jina.ai/";
const SOURCE_MARKDOWN_LIMIT = 6_000;

interface CuratedTopic {
  title: string;
  url: string;
}

let _groq: Groq | null = null;

function getGroqClient(): Groq {
  if (!_groq) {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured in environment variables");
    }
    _groq = new Groq({ apiKey: GROQ_API_KEY });
  }

  return _groq;
}

async function curateTopTopics(headlineList: string): Promise<CuratedTopic[]> {
  const groq = getGroqClient();

  const systemPrompt = `You are the Editor-in-Chief of a tech newsletter. Review the provided list of trending headlines. Select the 2 most distinct, high-quality technical topics. You MUST output your response as pure JSON containing an array of two objects. Example: [{ "title": "Headline 1", "url": "Link 1" }, { "title": "Headline 2", "url": "Link 2" }].`;

  const completion = await groq.chat.completions.create({
    model: CURATOR_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Trending headlines:\n${headlineList}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 600,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices?.[0]?.message?.content || "{}";
  let parsed: any;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Curator returned invalid JSON");
  }

  const candidates = extractTopicArray(parsed);
  const valid = candidates
    .map((item: any) => ({
      title: typeof item?.title === "string" ? item.title.trim() : "",
      url: typeof item?.url === "string" ? item.url.trim() : "",
    }))
    .filter((item) => item.title && isValidUrl(item.url))
    .slice(0, 2);

  if (valid.length < 2) {
    throw new Error("Curator did not return two valid topic URLs");
  }

  return valid;
}

function extractTopicArray(payload: any): any[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.topics)) {
    return payload.topics;
  }
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  return [];
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

async function fetchArticleMarkdown(url: string): Promise<string> {
  const response = await axios.get(`${JINA_READER_PREFIX}${url}`, {
    headers: {
      Accept: "text/markdown",
      "X-Return-Format": "markdown",
    },
    timeout: 30_000,
  });

  const markdown = typeof response.data === "string" ? response.data : String(response.data);
  return markdown.slice(0, SOURCE_MARKDOWN_LIMIT);
}

async function writeNewsletter(topics: CuratedTopic[], markdownA: string, markdownB: string): Promise<string> {
  const groq = getGroqClient();

  const systemPrompt = `You are an expert technical writer. Write a cohesive daily newsletter using the two provided source articles. Include a brief, conversational intro. Separate the topics with clear H2 headings. Apply a human, engaging tone. Do not use words like 'delve' or 'tapestry'. Preserve original markdown code blocks and image tags. End each section with a blockquote reference: > Source: [Title](URL).`;

  const userPrompt = `Create today's daily tech newsletter in markdown.

Article 1 title: ${topics[0].title}
Article 1 URL: ${topics[0].url}
Article 1 content:
${markdownA}

Article 2 title: ${topics[1].title}
Article 2 URL: ${topics[1].url}
Article 2 content:
${markdownB}`;

  const completion = await groq.chat.completions.create({
    model: WRITER_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.65,
    max_tokens: 4096,
  });

  const markdown = completion.choices?.[0]?.message?.content?.trim() || "";

  if (!markdown) {
    throw new Error("Newsletter writer returned empty content");
  }

  return markdown;
}

async function saveNewsletterDraft(markdown: string, topics: CuratedTopic[]) {
  const slug = `daily-tech-briefing-${Date.now()}`;
  const sourceReference = topics.map((t) => t.url).join("\n");

  const result = await pool.query(
    `INSERT INTO blogs (
      title,
      slug,
      content,
      type,
      status,
      generation_method,
      source_reference
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      "Daily Tech Briefing",
      slug,
      markdown,
      "newsletter",
      "draft",
      "ai_newsletter",
      sourceReference,
    ]
  );

  return result.rows[0];
}

/**
 * Automated daily newsletter pipeline.
 */
export async function generateDailyNewsletter() {
  console.log("[Newsletter] Starting daily newsletter generation...");

  const { numberedText } = await fetchTrendingHeadlines();
  const topics = await curateTopTopics(numberedText);

  const [markdownA, markdownB] = await Promise.all([
    fetchArticleMarkdown(topics[0].url),
    fetchArticleMarkdown(topics[1].url),
  ]);

  const finalMarkdown = await writeNewsletter(topics, markdownA, markdownB);
  const saved = await saveNewsletterDraft(finalMarkdown, topics);

  console.log(`[Newsletter] Draft saved with id: ${saved.id}`);
  return saved;
}
