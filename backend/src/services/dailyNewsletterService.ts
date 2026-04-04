import axios from "axios";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { pool } from "../db/connection";
import { fetchTrendingHeadlines, RssHeadline } from "../utils/rssFetcher";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const CURATOR_MODEL = process.env.GROQ_NEWSLETTER_CURATOR_MODEL || "";
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

async function curateTopTopics(
  headlineList: string,
  fallbackHeadlines: RssHeadline[]
): Promise<CuratedTopic[]> {
  const groq = getGroqClient();

  const systemPrompt = `You are the Editor-in-Chief of a premium tech newsletter. Review the provided list of trending RSS headlines.
Your job is to identify the SINGLE most dominant, highly technical trend of the day.
Select 2 to 3 articles from the list that all cover this SAME overarching topic from different angles.

You MUST output your response as pure JSON containing an array of objects.
Example: [{"title": "Article 1 about Topic X", "url": "Link 1"}, {"title": "Article 2 about Topic X", "url": "Link 2"}]`;

  const modelCandidates = getCuratorModelCandidates();
  let parsed: any = null;
  let lastError: any = null;

  for (const model of modelCandidates) {
    try {
      const completion = await groq.chat.completions.create({
        model,
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
      parsed = JSON.parse(raw);
      break;
    } catch (error: any) {
      lastError = error;
      const message = String(error?.message || "");
      const isDecommissioned =
        message.includes("model_decommissioned") ||
        message.toLowerCase().includes("decommissioned");

      if (isDecommissioned) {
        console.warn(`[Newsletter] Curator model unavailable: ${model}. Trying fallback...`);
        continue;
      }

      // Non-model errors should fail fast
      throw error;
    }
  }

  if (!parsed) {
    throw lastError || new Error("Curator failed on all candidate models");
  }

  const candidates = extractTopicArray(parsed);
  const valid = candidates
    .map((item: any) => ({
      title: typeof item?.title === "string" ? item.title.trim() : "",
      url: normalizePossibleUrl(item?.url),
    }))
    .filter((item) => item.title && isValidUrl(item.url))
    .slice(0, 3);

  if (valid.length >= 2) {
    return valid;
  }

  console.warn("[Newsletter] Curator returned incomplete topics. Using RSS fallback selection.");
  const fallback = selectFallbackTopics(fallbackHeadlines, 2);

  if (fallback.length < 2) {
    throw new Error("Curator did not return two valid topic URLs and fallback selection was insufficient");
  }

  return fallback;
}

function getCuratorModelCandidates(): string[] {
  const candidates = [
    CURATOR_MODEL,
    process.env.GROQ_MODEL || "",
    "llama-3.1-8b-instant",
    "llama-3.3-70b-versatile",
  ].map((m) => (m || "").trim());

  const deduped: string[] = [];
  for (const model of candidates) {
    if (!model || deduped.includes(model)) {
      continue;
    }
    deduped.push(model);
  }

  return deduped;
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

function normalizePossibleUrl(raw: any): string {
  if (typeof raw !== "string") {
    return "";
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  if (isValidUrl(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/https?:\/\/[^\s)\]]+/i);
  if (match && isValidUrl(match[0])) {
    return match[0];
  }

  return "";
}

function selectFallbackTopics(items: RssHeadline[], count: number): CuratedTopic[] {
  const picked: CuratedTopic[] = [];
  const usedDomains = new Set<string>();

  for (const item of items) {
    if (!item.title || !isValidUrl(item.link)) {
      continue;
    }

    let hostname = "";
    try {
      hostname = new URL(item.link).hostname.toLowerCase();
    } catch {
      continue;
    }

    if (usedDomains.has(hostname)) {
      continue;
    }

    usedDomains.add(hostname);
    picked.push({
      title: item.title,
      url: item.link,
    });

    if (picked.length === count) {
      break;
    }
  }

  // If distinct-domain filtering is too strict, fill remaining slots by order.
  if (picked.length < count) {
    for (const item of items) {
      if (!item.title || !isValidUrl(item.link)) {
        continue;
      }
      if (picked.find((p) => p.url === item.link)) {
        continue;
      }
      picked.push({ title: item.title, url: item.link });
      if (picked.length === count) {
        break;
      }
    }
  }

  return picked;
}

function mergeCandidateTopics(primary: CuratedTopic[], fallbackHeadlines: RssHeadline[]): CuratedTopic[] {
  const merged: CuratedTopic[] = [];
  const seen = new Set<string>();

  for (const topic of primary) {
    if (!topic?.title || !isValidUrl(topic.url) || seen.has(topic.url)) {
      continue;
    }
    seen.add(topic.url);
    merged.push(topic);
  }

  for (const item of fallbackHeadlines) {
    if (!item?.title || !isValidUrl(item.link) || seen.has(item.link)) {
      continue;
    }
    seen.add(item.link);
    merged.push({ title: item.title, url: item.link });
  }

  return merged;
}

async function fetchWorkingTopics(
  candidateTopics: CuratedTopic[],
  requiredCount: number
): Promise<Array<{ title: string; url: string; markdown: string }>> {
  const selected: Array<{ title: string; url: string; markdown: string }> = [];

  for (const topic of candidateTopics) {
    if (selected.length >= requiredCount) {
      break;
    }

    try {
      const markdown = await fetchArticleMarkdown(topic.url);
      if (!markdown || markdown.trim().length < 200) {
        console.warn(`[Newsletter] Skipping thin source: ${topic.url}`);
        continue;
      }

      selected.push({
        title: topic.title,
        url: topic.url,
        markdown,
      });
    } catch (error: any) {
      console.warn(`[Newsletter] Skipping source: ${topic.url} (${error.message})`);
    }
  }

  return selected;
}

async function fetchArticleMarkdown(url: string): Promise<string> {
  try {
    const response = await axios.get(`${JINA_READER_PREFIX}${url}`, {
      headers: {
        Accept: "text/markdown",
        "X-Return-Format": "markdown",
      },
      timeout: 30_000,
    });

    const markdown = typeof response.data === "string" ? response.data : String(response.data);
    return markdown.slice(0, SOURCE_MARKDOWN_LIMIT);
  } catch (error: any) {
    const status = error?.response?.status;
    const reason = status ? `status ${status}` : (error?.message || "unknown error");
    throw new Error(`Jina fetch failed for ${url} (${reason})`);
  }
}

async function writeNewsletter(topics: CuratedTopic[], markdownA: string, markdownB: string): Promise<string> {
  const groq = getGroqClient();

  const systemPrompt = `You are an expert technical writer. Write a cohesive, deep-dive technical newsletter about a single trending topic, using the provided source articles as context.

CRITICAL INSTRUCTIONS:
1. Do NOT just summarize the articles one by one. Synthesize the information into a single, comprehensive "masterclass" style blog post about the core topic.
2. Write conversationally, as if explaining this to a colleague. DO NOT use generic AI intro phrases like "Hello and welcome to today's daily tech newsletter." Start immediately with a strong, punchy hook about the topic.
3. Apply our strict 'Anti-Robot' tone rules. Do not use words like 'delve' or 'tapestry'.
4. Structure the post with clear H2 and H3 headings.
5. Preserve original markdown code blocks and relevant image tags ![alt](url). Discard useless logos.
6. End each main section with a blockquote reference: > Source: [Title](URL).`;

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

  try {
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
  } catch (error: any) {
    // Backward compatibility if blogs.type has not been migrated yet.
    if (error?.code !== "42703") {
      throw error;
    }

    const fallback = await pool.query(
      `INSERT INTO blogs (
        title,
        slug,
        content,
        status,
        generation_method,
        source_reference
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        "Daily Tech Briefing",
        slug,
        markdown,
        "draft",
        "ai_newsletter",
        sourceReference,
      ]
    );

    return fallback.rows[0];
  }
}

/**
 * Automated daily newsletter pipeline.
 */
export async function generateDailyNewsletter() {
  console.log("[Newsletter] Starting daily newsletter generation...");

  const { numberedText, items } = await fetchTrendingHeadlines();
  const curatedTopics = await curateTopTopics(numberedText, items);
  const candidateTopics = mergeCandidateTopics(curatedTopics, items);
  const workingTopics = await fetchWorkingTopics(candidateTopics, 2);

  if (workingTopics.length < 2) {
    throw new Error("Unable to fetch two usable source articles for newsletter generation");
  }

  const finalTopics: CuratedTopic[] = workingTopics.map((t) => ({ title: t.title, url: t.url }));
  const finalMarkdown = await writeNewsletter(
    finalTopics,
    workingTopics[0].markdown,
    workingTopics[1].markdown
  );
  const saved = await saveNewsletterDraft(finalMarkdown, finalTopics);

  console.log(`[Newsletter] Draft saved with id: ${saved.id}`);
  return saved;
}
