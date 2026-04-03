/**
 * Blog Generator Service
 *
 * Lightweight AI blog generation pipeline:
 * - Jina Reader (r.jina.ai) for zero-RAM markdown extraction (preserves code + images)
 * - Jina Search (s.jina.ai) for keyword-based discovery
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

/** Context limits — generous enough to capture images + code, but safe for 128K ctx */
const URL_CONTENT_LIMIT = 12_000; // single URL mode
const KEYWORD_PER_SOURCE_LIMIT = 4_000; // per source in keyword mode
const KEYWORD_MAX_SOURCES = 5;      // search up to 5, use what responds

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
 * Jina automatically extracts code blocks and images into Markdown format.
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
    { headers, timeout: 30_000 }
  );

  const data = response.data;

  // Jina search returns { data: [{ url, title, content }, ...] }
  if (data?.data && Array.isArray(data.data)) {
    return data.data
      .slice(0, KEYWORD_MAX_SOURCES)
      .map((item: { url?: string }) => item.url)
      .filter(Boolean) as string[];
  }

  // Fallback: parse URLs from raw text response
  if (typeof data === "string") {
    const urlRegex = /https?:\/\/[^\s)>\]"']+/g;
    const matches = data.match(urlRegex) || [];
    return matches
      .filter((u: string) => !u.includes("jina.ai"))
      .slice(0, KEYWORD_MAX_SOURCES);
  }

  return [];
}

// ---------------------------------------------------------------------------
// Groq generation
// ---------------------------------------------------------------------------

async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  console.log(`🤖 [Groq] Starting generation with model: ${GROQ_MODEL}...`);
  const startTime = Date.now();
  const groq = getGroqClient();

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✨ [Groq] Generation complete in ${duration}s`);
    return completion.choices?.[0]?.message?.content || "";
  } catch (err: any) {
    console.error(`❌ [Groq] API Error: ${err.message}`);
    throw err;
  }
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

// ---------------------------------------------------------------------------
// Scenario A: URL Mode
// ---------------------------------------------------------------------------

export async function generateFromUrl(
  url: string
): Promise<BlogGenerationResult> {
  console.log("\n" + "=".repeat(60));
  console.log(`🚀 [URL Mode] ${url}`);
  console.log("=".repeat(60));

  // Step 1: Scrape
  console.log(`🌐 [Step 1] Scraping via Jina Reader...`);
  let markdown: string;
  try {
    markdown = await fetchMarkdownFromUrl(url);
    console.log(`✅ [Step 1] ${markdown.length.toLocaleString()} chars received`);
  } catch (err: any) {
    console.error(`❌ [Step 1] Scrape failed: ${err.message}`);
    throw new Error(`Failed to retrieve article content from URL: ${err.message}`);
  }

  if (!markdown || markdown.trim().length < 50) {
    throw new Error("The URL returned insufficient content to generate a blog post");
  }

  // Step 2: Slice
  console.log(`✂️  [Step 2] Slicing to ${URL_CONTENT_LIMIT.toLocaleString()} chars...`);
  const sliced = markdown.slice(0, URL_CONTENT_LIMIT);

  // Step 3: Generate
  console.log(`🤖 [Step 3] Sending to Groq...`);

  const systemPrompt = `You are an expert, highly experienced senior developer writing a technical blog post. 

CRITICAL VOICE & TONE RULES:
1. Write conversationally, as if you are explaining this to a colleague over coffee. Use active voice and contractions (e.g., "you'll", "we're", "don't").
2. Vary your sentence lengths dramatically. Mix very short, punchy sentences with longer, detailed explanatory ones. 
3. NEVER use generic AI transition phrases. Do not use: "In conclusion", "Furthermore", "Moreover", "Additionally", or "Let's dive in".
4. BANISHED WORDS: You are strictly forbidden from using the following words: delve, tapestry, testament, landscape, crucial, vital, beacon, realm, or unleash.
5. If explaining a complex concept, use a brief, relatable real-world analogy. 

CRITICAL FORMATTING RULES:
1. Output PURE Markdown only. No HTML tags.
2. Include double line breaks (\\n\\n) before and after EVERY heading, list, and paragraph.
3. Code blocks MUST have the closing triple backticks (\`\`\`) on their own isolated, empty line.
4. Keep relevant image tags ![alt](url) but discard useless logos or stock photos.
5. At the end of EVERY main section, add a blockquote citation exactly like this: \`> Source: [Title](URL)\`.`;

  const userPrompt = `Transform the following scraped content into a complete, polished tech blog post.

IMPORTANT: After every H2 section, add a reference formatted exactly as a blockquote:
> Source: [Original Article](${url})

Original Source URL: ${url}

Scraped Content:
${sliced}`;

  const generated = await generateWithGroq(systemPrompt, userPrompt);
  const { title, body } = extractTitleAndBody(generated);

  return {
    title,
    content: body,
    generationMethod: "ai_url",
    sourceReference: url,
  };
}

// ---------------------------------------------------------------------------
// Scenario B: Keyword Mode
// ---------------------------------------------------------------------------

export async function generateFromKeyword(
  keyword: string
): Promise<BlogGenerationResult> {
  console.log("\n" + "=".repeat(60));
  console.log(`🚀 [Keyword Mode] "${keyword}"`);
  console.log("=".repeat(60));

  // Step 1: Search
  console.log(`🔍 [Step 1] Searching with Jina Search...`);
  let urls: string[];
  try {
    urls = await searchWithJina(keyword);
    console.log(`🔗 [Step 1] Found ${urls.length} candidate URLs:`);
    urls.forEach((u, i) => console.log(`   ${i + 1}. ${u}`));
  } catch (err: any) {
    console.error(`❌ [Step 1] Search failed: ${err.message}`);
    throw new Error(`Search failed for keyword "${keyword}": ${err.message}`);
  }

  if (urls.length === 0) {
    throw new Error(
      `No relevant sources found for keyword "${keyword}". Try a different search term.`
    );
  }

  // Step 2: Scrape each source
  console.log(`📝 [Step 2] Scraping ${urls.length} sources...`);
  const sources: Array<{ url: string; content: string }> = [];

  for (const url of urls) {
    try {
      console.log(`   🌐 Scraping: ${url}...`);
      const md = await fetchMarkdownFromUrl(url);
      if (md && md.trim().length > 50) {
        console.log(`   ✅ ${md.length.toLocaleString()} chars received`);
        sources.push({ url, content: md.slice(0, KEYWORD_PER_SOURCE_LIMIT) });
      } else {
        console.warn(`   ⚠️  Skipped — content too short`);
      }
    } catch {
      console.warn(`   ⚠️  Failed to scrape, skipping.`);
    }
  }

  console.log(`📊 [Step 2] Using ${sources.length}/${urls.length} sources`);

  if (sources.length === 0) {
    throw new Error(
      "Failed to retrieve content from any search results. Try a different keyword."
    );
  }

  const systemPrompt = `You are an expert, highly experienced senior developer writing a technical blog post. 

CRITICAL VOICE & TONE RULES:
1. Write conversationally, as if you are explaining this to a colleague over coffee. Use active voice and contractions (e.g., "you'll", "we're", "don't").
2. Vary your sentence lengths dramatically. Mix very short, punchy sentences with longer, detailed explanatory ones. 
3. NEVER use generic AI transition phrases. Do not use: "In conclusion", "Furthermore", "Moreover", "Additionally", or "Let's dive in".
4. BANISHED WORDS: You are strictly forbidden from using the following words: delve, tapestry, testament, landscape, crucial, vital, beacon, realm, or unleash.
5. If explaining a complex concept, use a brief, relatable real-world analogy. 

CRITICAL FORMATTING RULES:
1. Output PURE Markdown only. No HTML tags.
2. Include double line breaks (\\n\\n) before and after EVERY heading, list, and paragraph.
3. Code blocks MUST have the closing triple backticks (\`\`\`) on their own isolated, empty line.
4. Keep relevant image tags ![alt](url) but discard useless logos or stock photos.
5. At the end of EVERY main section, add a blockquote citation exactly like this: \`> Source: [Title](URL)\`.`;

  // Build numbered source blocks with clear labels
  const sourceBlocks = sources
    .map((s, i) => `Source ${i + 1}: ${s.url}\nContent ${i + 1}:\n${s.content}`)
    .join("\n\n---\n\n");

  const userPrompt = `Write a comprehensive, original tech blog post about: "${keyword}".

Use the sources below as your research. After EVERY H2 section, add a reference formatted as a blockquote:
> Source: [Title of the source you used](URL of that source)

Do NOT wait until the end of the blog — put the reference immediately after the section text.

${sourceBlocks}`;

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

function extractTitleAndBody(markdown: string): { title: string; body: string } {
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
