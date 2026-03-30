/**
 * Blog Generator Service
 *
 * Lightweight AI blog generation pipeline:
 * - Jina Reader (r.jina.ai) for zero-RAM markdown extraction
 * - Jina Search (s.jina.ai) for keyword-based search
 * - Groq API for ultra-fast LLM inference
 */

import Groq from "groq-sdk";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const JINA_API_KEY = process.env.JINA_API_KEY || "";

const JINA_READER_PREFIX = "https://r.jina.ai/";
const JINA_SEARCH_PREFIX = "https://s.jina.ai/";

/** Hard limits to stay within Groq context window */
const URL_CONTENT_LIMIT = 8_000; // single URL mode
const KEYWORD_PER_SOURCE_LIMIT = 3_000; // per source in keyword mode
const KEYWORD_MAX_SOURCES = 3;

// ---------------------------------------------------------------------------
// Groq client (lazy singleton)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Jina helpers
// ---------------------------------------------------------------------------

/**
 * Fetch a URL's content as clean Markdown via Jina Reader.
 * Returns the markdown string, or throws on failure.
 */
async function fetchMarkdownFromUrl(url: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "text/markdown",
    "X-Return-Format": "markdown",
  };
  if (JINA_API_KEY) {
    headers["Authorization"] = `Bearer ${JINA_API_KEY}`;
  }

  const response = await axios.get(`${JINA_READER_PREFIX}${url}`, {
    headers,
    timeout: 25_000,
  });
  return typeof response.data === "string" ? response.data : String(response.data);
}

/**
 * Search for relevant URLs via Jina Search.
 * Returns an array of URLs extracted from the search results.
 */
async function searchWithJina(query: string): Promise<string[]> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Return-Format": "json",
  };
  if (JINA_API_KEY) {
    headers["Authorization"] = `Bearer ${JINA_API_KEY}`;
  }

  const response = await axios.get(
    `${JINA_SEARCH_PREFIX}${encodeURIComponent(query)}`,
    {
      headers,
      timeout: 30_000,
    }
  );

  const data = response.data;

  // Jina search returns { data: [{ url, title, content }, ...] }
  if (data?.data && Array.isArray(data.data)) {
    return data.data
      .slice(0, KEYWORD_MAX_SOURCES)
      .map((item: { url?: string }) => item.url)
      .filter(Boolean) as string[];
  }

  // Fallback: if response is text, try to extract URLs with regex
  if (typeof data === "string") {
    const urlRegex = /https?:\/\/[^\s)>\]"']+/g;
    const matches = data.match(urlRegex) || [];
    // Filter out Jina's own URLs
    return matches
      .filter((u: string) => !u.includes("jina.ai"))
      .slice(0, KEYWORD_MAX_SOURCES);
  }

  return [];
}

// ---------------------------------------------------------------------------
// Groq generation helpers
// ---------------------------------------------------------------------------

async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  return completion.choices?.[0]?.message?.content || "";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface BlogGenerationResult {
  title: string;
  content: string;
  generationMethod: "ai_url" | "ai_keyword";
  sourceReference: string;
}

/**
 * Scenario A: Generate a blog post from a single URL.
 *
 * 1. Fetch markdown via Jina Reader
 * 2. Slice to URL_CONTENT_LIMIT characters
 * 3. Send to Groq for rewriting
 */
export async function generateFromUrl(
  url: string
): Promise<BlogGenerationResult> {
  // Step 1: Fetch markdown
  let markdown: string;
  try {
    markdown = await fetchMarkdownFromUrl(url);
  } catch (err: any) {
    throw new Error(
      `Failed to retrieve article content from URL: ${err.message}`
    );
  }

  if (!markdown || markdown.trim().length < 50) {
    throw new Error(
      "The URL returned insufficient content to generate a blog post"
    );
  }

  // Step 2: Slice to fit context
  const sliced = markdown.slice(0, URL_CONTENT_LIMIT);

  // Step 3: Generate via Groq
  const systemPrompt = `You are an expert tech blog writer. Your task is to rewrite and synthesize provided markdown into a highly engaging, SEO-friendly blog post. Always output in clean Markdown format.`;

  const userPrompt = `Rewrite and synthesize the following markdown into a highly engaging, SEO-friendly blog post. Include a catchy title on the first line as a Markdown H1 (# Title), followed by structured headings (##, ###), and well-organized content paragraphs.

Content:
${sliced}`;

  const generated = await generateWithGroq(systemPrompt, userPrompt);

  // Extract title from the first H1 line
  const { title, body } = extractTitleAndBody(generated);

  return {
    title,
    content: body,
    generationMethod: "ai_url",
    sourceReference: url,
  };
}

/**
 * Scenario B: Generate a blog post from a keyword search.
 *
 * 1. Search via Jina Search for relevant URLs
 * 2. Fetch markdown for each URL via Jina Reader
 * 3. Slice + concatenate
 * 4. Send to Groq for original synthesis
 */
export async function generateFromKeyword(
  keyword: string
): Promise<BlogGenerationResult> {
  // Step 1: Search for URLs
  let urls: string[];
  try {
    urls = await searchWithJina(keyword);
  } catch (err: any) {
    throw new Error(`Search failed for keyword "${keyword}": ${err.message}`);
  }

  if (urls.length === 0) {
    throw new Error(
      `No relevant sources found for keyword "${keyword}". Try a different search term.`
    );
  }

  // Step 2 & 3: Fetch + slice each source
  const sourceParts: string[] = [];
  const successfulUrls: string[] = [];

  for (const url of urls) {
    try {
      const markdown = await fetchMarkdownFromUrl(url);
      if (markdown && markdown.trim().length > 50) {
        sourceParts.push(
          `--- Source: ${url} ---\n${markdown.slice(0, KEYWORD_PER_SOURCE_LIMIT)}`
        );
        successfulUrls.push(url);
      }
    } catch (err) {
      // Skip failed URLs silently — we have others
      console.warn(`⚠️ Jina Reader failed for ${url}, skipping.`);
    }
  }

  if (sourceParts.length === 0) {
    throw new Error(
      "Failed to retrieve content from any of the search results. Try a different keyword."
    );
  }

  const concatenated = sourceParts.join("\n\n");

  // Step 4: Generate via Groq
  const systemPrompt = `You are an expert tech blog writer. Your task is to write a comprehensive, engaging, and original blog post based on provided research context. Always output in clean Markdown format. Do NOT copy content verbatim — synthesize and add original insight.`;

  const userPrompt = `Based on the following gathered context, write a comprehensive, engaging, and original blog post about "${keyword}".

Include:
- A catchy title on the first line as a Markdown H1 (# Title)
- Structured headings (##, ###)
- An introduction, main sections, and a conclusion
- Key takeaways or actionable insights

Research Context:
${concatenated}`;

  const generated = await generateWithGroq(systemPrompt, userPrompt);

  const { title, body } = extractTitleAndBody(generated);

  return {
    title,
    content: body,
    generationMethod: "ai_keyword",
    sourceReference: keyword,
  };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function extractTitleAndBody(markdown: string): {
  title: string;
  body: string;
} {
  const lines = markdown.split("\n");
  let title = "Untitled Blog Post";
  let bodyStartIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("# ")) {
      title = trimmed.replace(/^#+\s*/, "").trim();
      bodyStartIndex = i + 1;
      break;
    }
  }

  const body = lines.slice(bodyStartIndex).join("\n").trim();
  return { title, body: body || markdown };
}
