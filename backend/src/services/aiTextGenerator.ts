import axios from "axios";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const JINA_API_KEY = process.env.JINA_API_KEY || "";
const JINA_READER_PREFIX = "https://r.jina.ai/";

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

async function fetchMarkdownFromUrl(url: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "text/markdown",
    "X-Return-Format": "markdown",
  };

  if (JINA_API_KEY) {
    headers.Authorization = `Bearer ${JINA_API_KEY}`;
  }

  const response = await axios.get(`${JINA_READER_PREFIX}${url}`, {
    headers,
    timeout: 30_000,
  });

  return typeof response.data === "string" ? response.data : String(response.data);
}

function extractTitleAndBody(markdown: string): { title: string; content: string } {
  const lines = markdown.split("\n");
  let title = "";
  let bodyStartIndex = 0;

  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("# ") || trimmed.startsWith("## ")) {
      title = trimmed.replace(/^#+\s*/, "").trim();
      bodyStartIndex = i + 1;
      if (title.length > 3) break;
    }
  }

  if (!title) {
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const trimmed = lines[i].trim();
      if (
        /^(Title|Proposed Title|Article Title|Headline|Subject|Topic):\s*/i.test(trimmed)
      ) {
        title = trimmed
          .replace(/^(Title|Proposed Title|Article Title|Headline|Subject|Topic):\s*/i, "")
          .trim();
        bodyStartIndex = i + 1;
        break;
      }
    }
  }

  if (!title) {
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const trimmed = lines[i].trim();
      if (trimmed && !trimmed.startsWith(">") && !trimmed.startsWith("![") && trimmed.length > 5) {
        title = trimmed;
        bodyStartIndex = i + 1;
        break;
      }
    }
  }

  if (!title) {
    title = "Strategic Synthesis Analysis";
    bodyStartIndex = 0;
  }

  const content = lines.slice(bodyStartIndex).join("\n").trim() || markdown;
  return { title, content };
}

export async function generateAIText(
  urls: string[],
  systemPrompt: string
): Promise<{ title: string; content: string }> {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error("At least one source URL is required");
  }

  const uniqueUrls = [...new Set(urls.map((u) => String(u || "").trim()).filter(Boolean))];
  if (uniqueUrls.length === 0) {
    throw new Error("No valid source URLs provided");
  }

  const sourceSections: string[] = [];
  for (const url of uniqueUrls) {
    const markdown = await fetchMarkdownFromUrl(url);
    if (!markdown || markdown.trim().length < 50) {
      continue;
    }

    sourceSections.push(`Source URL: ${url}\n${markdown.slice(0, 6_000)}`);
  }

  if (sourceSections.length === 0) {
    throw new Error("Failed to fetch usable content from provided URLs");
  }

  const userPrompt = `Generate a single cohesive markdown article from the sources below.
Start with one H1 heading.

${sourceSections.join("\n\n---\n\n")}`;

  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.75,
    max_tokens: 4096,
  });

  const generated = completion.choices?.[0]?.message?.content?.trim() || "";
  if (!generated) {
    throw new Error("Groq returned empty content");
  }

  return extractTitleAndBody(generated);
}

