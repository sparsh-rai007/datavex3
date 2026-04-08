import axios from "axios";
import dotenv from "dotenv";
import { generateAIText } from "./aiTextGenerator";

dotenv.config();

const JINA_API_KEY = process.env.JINA_API_KEY || "";
const JINA_SEARCH_PREFIX = "https://s.jina.ai/";
const KEYWORD_MAX_SCRAPE_SOURCES = 3;
const MAX_SIDEBAR_LINKS = 8;

const HUMANIZED_SYSTEM_PROMPT = `You are a seasoned, pragmatic software engineer writing a technical blog post. You write like a real human-opinionated, slightly informal, direct, and conversational. Skip fluff and academic framing.

CRITICAL RULES:
1. Start with one '# ' H1 title.
2. Use markdown only.
3. Use clear section headings (## and ###).
4. Keep structure varied and natural.
5. Keep useful image links when relevant.
6. Use concrete, practical examples.`;

export type BlogTone = "human" | "professional" | "executive" | "academic";

const TONE_PROMPTS: Record<BlogTone, string> = {
  human: HUMANIZED_SYSTEM_PROMPT,
  professional: `You are a professional technical writer. Write in a clear, authoritative, accessible tone with concise structure.`,
  executive: `You are a strategic consultant writing for leadership. Focus on business impact, ROI, risk, and execution clarity.`,
  academic: `You are a researcher writing a detailed technical paper. Use formal language, precision, and deep analysis.`,
};

export interface SearchResult {
  title: string;
  url: string;
}

export interface BlogGenerationResult {
  title: string;
  content: string;
  generationMethod: "ai_url" | "ai_keyword";
  sourceReference: string;
}

async function searchWithJina(query: string): Promise<SearchResult[]> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Return-Format": "json",
  };

  if (JINA_API_KEY) {
    headers.Authorization = `Bearer ${JINA_API_KEY}`;
  }

  try {
    const response = await axios.get(`${JINA_SEARCH_PREFIX}${encodeURIComponent(query)}`, {
      headers,
      timeout: 30_000,
    });

    const data = response.data;
    if (data?.data && Array.isArray(data.data)) {
      return data.data
        .filter((item: any) => item.url && !String(item.url).includes("jina.ai"))
        .map((item: any) => ({
          title: item.title || "Related Resource",
          url: item.url,
        }));
    }

    if (typeof data === "string") {
      const urlRegex = /https?:\/\/[^\s)>\]"']+/g;
      const matches = data.match(urlRegex) || [];
      return matches
        .filter((u: string) => !u.includes("jina.ai"))
        .map((u: string) => ({ title: "Related Resource", url: u }));
    }
  } catch (err: any) {
    console.warn(`[BlogGenerator] Jina Search warning: ${err.message}`);
  }

  return [];
}

export async function generateFromUrl(
  url: string,
  tone: BlogTone = "human"
): Promise<BlogGenerationResult> {
  const systemPrompt = TONE_PROMPTS[tone] || HUMANIZED_SYSTEM_PROMPT;
  const generated = await generateAIText([url], systemPrompt);

  const relatedLinks = await searchWithJina(generated.title);
  let content = generated.content;

  if (relatedLinks.length > 0) {
    content += "\n\n## References\n";
    relatedLinks.slice(0, MAX_SIDEBAR_LINKS).forEach((link) => {
      content += `* [${link.title}](${link.url})\n`;
    });
  }

  return {
    title: generated.title,
    content,
    generationMethod: "ai_url",
    sourceReference: url,
  };
}

export async function generateFromKeyword(
  keyword: string,
  tone: BlogTone = "human"
): Promise<BlogGenerationResult> {
  const searchResults = await searchWithJina(keyword);
  if (searchResults.length === 0) {
    throw new Error(`No relevant sources found for keyword "${keyword}".`);
  }

  const scrapeTargets = searchResults.slice(0, KEYWORD_MAX_SCRAPE_SOURCES).map((s) => s.url);
  const systemPrompt = TONE_PROMPTS[tone] || HUMANIZED_SYSTEM_PROMPT;
  const generated = await generateAIText(scrapeTargets, systemPrompt);

  let content = generated.content;
  content += "\n\n## References\n";
  searchResults.slice(0, MAX_SIDEBAR_LINKS).forEach((link) => {
    content += `* [${link.title}](${link.url})\n`;
  });

  return {
    title: generated.title,
    content,
    generationMethod: "ai_keyword",
    sourceReference: keyword,
  };
}

export interface TocItem {
  level: number;
  text: string;
  slug: string;
}

export function extractTableOfContents(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match: RegExpExecArray | null;

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
