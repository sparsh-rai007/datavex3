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
const KEYWORD_MAX_SCRAPE_SOURCES = 3; // Only scrape top 3 for speed and context limit
const MAX_SIDEBAR_LINKS = 8; // Number of related links to fetch for the frontend sidebar

// ---------------------------------------------------------------------------
// AI Prompts
// ---------------------------------------------------------------------------

const HUMANIZED_SYSTEM_PROMPT = `You are a seasoned, pragmatic software engineer writing a technical blog post. You write like a real human—opinionated, slightly informal, direct, and conversational. Skip the fluff and academic framing.

CRITICAL VOICE & TONE RULES:
1. Write exactly as you would speak to a colleague on Slack or over coffee. Use active voice and common contractions (e.g., "you'll", "we're", "don't", "it's").
2. Show a bit of personality. It's okay to admit when a concept is annoying, confusing, or overly hyped. Occasional mild developer slang or colloquialisms are highly encouraged.
3. Vary your pacing dramatically. Mix very short, punchy sentences (even one-word sentences for emphasis) with longer explanatory ones. Use one-sentence paragraphs occasionally to make a point.
4. NEVER use generic AI transition phrases. Banned transitions: "In conclusion", "Furthermore", "Moreover", "Additionally", "Let's dive in", "It's worth noting", "To summarize".
5. EXTENDED BANISHED WORDS LIST: You are strictly forbidden from using: delve, tapestry, testament, landscape, crucial, vital, beacon, realm, unleash, robust, seamless, navigate, ultimate, paradigm, or "in today's digital age".

CRITICAL FORMATTING & STRUCTURE RULES:
1. TITLE: You MUST start every response with a single '# ' H1 heading that serves as a punchy, suitable title for the blog post.
2. Output PURE Markdown only. No HTML tags.
3. SUBHEADINGS: You MUST use frequent, catchy side headings/subheadings (## and ###) to organize the content. Do not output massive walls of text without a heading to break them up.
4. Real humans don't write perfectly symmetrical articles. Avoid having exactly three paragraphs under every single heading. Make some sections long and detailed, and others incredibly brief.
5. Include double line breaks (\\n\\n) before and after EVERY heading, list, and paragraph.
6. Code blocks MUST have the closing triple backticks (\`\`\`) on their own isolated, empty line.
7. Keep relevant image tags ![alt](url) but discard useless logos or stock photos.
8. At the end of EVERY main section, add a blockquote citation containing ONLY the link, like this: \`> [Title](URL)\`. Do not use the word "Source:".`;

export type BlogTone = 'human' | 'professional' | 'executive' | 'academic';

const TONE_PROMPTS: Record<BlogTone, string> = {
  human: HUMANIZED_SYSTEM_PROMPT,
  professional: `You are a professional technical writer. Write in a clear, authoritative, yet accessible tone. 
Keep it business-professional but engaging. Avoid excessive jargon unless necessary. 
Use standard formatting and clear headings.`,
  executive: `You are a strategic consultant writing for a C-suite audience. Focus on high-level strategy, ROI, market impact, and digital transformation. 
Use bullet points for key takeaways. Keep it concise, punchy, and results-oriented.`,
  academic: `You are a researcher writing a detailed technical whitepaper. Use formal language, precise terminology, and a structured, logical flow. 
Focus on depth, evidence, and comprehensive explanations.`
};

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

export interface SearchResult {
  title: string;
  url: string;
}

/**
 * Search for relevant URLs via Jina Search. Returns an array of Titles and URLs.
 */
async function searchWithJina(query: string): Promise<SearchResult[]> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Return-Format": "json",
  };
  if (JINA_API_KEY) {
    headers["Authorization"] = `Bearer ${JINA_API_KEY}`;
  }

  try {
    const response = await axios.get(
      `${JINA_SEARCH_PREFIX}${encodeURIComponent(query)}`,
      { headers, timeout: 30_000 }
    );

    const data = response.data;

    // Jina search returns { data: [{ url, title, content }, ...] }
    if (data?.data && Array.isArray(data.data)) {
      return data.data
        .filter((item: any) => item.url && !item.url.includes("jina.ai"))
        .map((item: any) => ({
          title: item.title || "Related Resource",
          url: item.url
        }));
    }

    // Fallback: parse URLs from raw text response if JSON fails
    if (typeof data === "string") {
      const urlRegex = /https?:\/\/[^\s)>\]"']+/g;
      const matches = data.match(urlRegex) || [];
      return matches
        .filter((u: string) => !u.includes("jina.ai"))
        .map((u: string) => ({ title: "Related Resource", url: u }));
    }
  } catch (err: any) {
    console.warn(`⚠️ Jina Search warning: ${err.message}`);
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
      temperature: 0.85, // Increased from 0.7 for more creative/human variance
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
// Interfaces
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
  url: string,
  tone: BlogTone = 'human'
): Promise<BlogGenerationResult> {
  console.log("\n" + "=".repeat(60));
  console.log(`🚀 [URL Mode] ${url} | Tone: ${tone}`);
  console.log("=".repeat(60));

  // Step 1: Scrape
  console.log(`🌐 [Step 1] Scraping via Jina Reader...`);
  let markdown: string;
  try {
    markdown = await fetchMarkdownFromUrl(url);
    console.log(`✅ [Step 1] ${markdown.length.toLocaleString()} chars received`);
  } catch (err: any) {
    throw new Error(`Failed to retrieve article content from URL: ${err.message}`);
  }

  if (!markdown || markdown.trim().length < 50) {
    throw new Error("The URL returned insufficient content to generate a blog post");
  }

  // Step 2: Slice & Generate
  const sliced = markdown.slice(0, URL_CONTENT_LIMIT);
  
  // Step 3: Generate
  console.log(`🤖 [Step 3] Sending to Groq...`);

  const userPrompt = `Generate a high-impact technical blog post based on the following content. 
Start with a single '# ' H1 heading that provides a suitable, engaging title.
Remember to add ([Source](${url})) at the end of any paragraph that uses facts or concepts. Do not create a separate references block.

Original Source URL: ${url}
Scraped Content:
${sliced}`;

  const systemPrompt = TONE_PROMPTS[tone] || HUMANIZED_SYSTEM_PROMPT;
  const generated = await generateWithGroq(systemPrompt, userPrompt);
  let { title, body } = extractTitleAndBody(generated);

  // Step 4: Fetch Extra Related Links for the Frontend Sidebar
  console.log(`🔍 [Step 4] Fetching ${MAX_SIDEBAR_LINKS} related links for sidebar...`);
  const relatedLinks = await searchWithJina(title); // Search using the AI-generated title
  
  if (relatedLinks.length > 0) {
    body += `\n\n## References\n`;
    relatedLinks.slice(0, MAX_SIDEBAR_LINKS).forEach(link => {
      body += `* [${link.title}](${link.url})\n`;
    });
  }

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
  keyword: string,
  tone: BlogTone = 'human'
): Promise<BlogGenerationResult> {
  console.log("\n" + "=".repeat(60));
  console.log(`🚀 [Keyword Mode] "${keyword}" | Tone: ${tone}`);
  console.log("=".repeat(60));

  // Step 1: Search
  console.log(`🔍 [Step 1] Searching with Jina Search...`);
  const searchResults = await searchWithJina(keyword);
  
  if (searchResults.length === 0) {
    throw new Error(`No relevant sources found for keyword "${keyword}".`);
  }

  // Step 2: Scrape top sources for AI context
  const scrapeTargets = searchResults.slice(0, KEYWORD_MAX_SCRAPE_SOURCES);
  console.log(`📝 [Step 2] Scraping top ${scrapeTargets.length} sources...`);
  const sources: Array<{ url: string; content: string }> = [];

  for (const target of scrapeTargets) {
    try {
      const md = await fetchMarkdownFromUrl(target.url);
      if (md && md.trim().length > 50) {
        sources.push({ url: target.url, content: md.slice(0, KEYWORD_PER_SOURCE_LIMIT) });
      }
    } catch {
      console.warn(`   ⚠️  Failed to scrape ${target.url}, skipping.`);
    }
  }

  if (sources.length === 0) {
    throw new Error("Failed to retrieve content from any search results.");
  }

  // Step 3: Generate
  console.log(`🤖 [Step 3] Sending to Groq...`);

  const sourceBlocks = sources
    .map((s) => `Source URL: ${s.url}\nContent:\n${s.content}`)
    .join("\n\n---\n\n");

  const userPrompt = `Write a comprehensive technical blog post about: "${keyword}".
Start with a single '# ' H1 heading that serves as a suitable title for the content.
Focus on what actually matters to the intended audience.

Use the sources below as your research. Remember to add ([Source](SPECIFIC_URL)) at the end of any paragraph that uses facts or concepts. Do not create a separate references block.

${sourceBlocks}`;

  const systemPrompt = TONE_PROMPTS[tone] || HUMANIZED_SYSTEM_PROMPT;
  const generated = await generateWithGroq(systemPrompt, userPrompt);
  let { title, body } = extractTitleAndBody(generated);

  // Step 4: Inject the related links for the frontend sidebar
  if (searchResults.length > 0) {
    body += `\n\n## References\n`;
    searchResults.slice(0, MAX_SIDEBAR_LINKS).forEach(link => {
      body += `* [${link.title}](${link.url})\n`;
    });
  }

  return {
    title,
    content: body,
    generationMethod: "ai_keyword",
    sourceReference: keyword,
  };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function extractTitleAndBody(markdown: string): { title: string; body: string } {
  const lines = markdown.split("\n");
  let title = "";
  let bodyStartIndex = -1;

  // 🏛️ Robust Tier 1: Look for first H1 line (# )
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("# ")) {
      title = trimmed.replace(/^#+\s*/, "").trim();
      bodyStartIndex = i + 1;
      break;
    }
  }

  // 🧱 Robust Tier 2: If no H1 found, look for first non-empty line that isn't filler
  if (!title) {
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const trimmed = lines[i].trim();
      if (trimmed && !trimmed.startsWith(">") && !trimmed.startsWith("![") && trimmed.length > 5) {
        // Clean common prefixes if any
        title = trimmed.replace(/^(Title|Proposed Title|Article Title|Headline):\s*/i, "").trim();
        bodyStartIndex = i + 1;
        break;
      }
    }
  }

  // 🛡️ Fallback: Untitled
  if (!title) {
    return { title: "Strategic Synthesis Analysis", body: markdown };
  }

  const body = lines.slice(bodyStartIndex).join("\n").trim();
  return { title, body: body || markdown };
}

export interface TocItem {
  level: number;
  text: string;
  slug: string;
}

/**
 * Extracts ## and ### headings from a markdown string to build a frontend Table of Contents
 */
export function extractTableOfContents(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length; 
    const text = match[2].trim();
    
    const slug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    headings.push({ level, text, slug });
  }

  return headings;
}