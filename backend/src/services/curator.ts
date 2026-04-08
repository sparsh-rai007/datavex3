import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const CURATOR_MODEL = process.env.GROQ_MODEL || "";

interface CuratedArticle {
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

function extractArrayFromPayload(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.articles)) return payload.articles;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
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

export async function curateTopTrendUrls(headlineList: string): Promise<string[]> {
  const groq = getGroqClient();

  const systemPrompt =
    'You are the Editor-in-Chief of a premium tech newsletter. Review the provided list of trending RSS headlines. Identify the SINGLE most dominant, highly technical trend of the day. Select 2 to 3 articles from the list that all cover this SAME overarching topic. Output your response as pure JSON containing an array of objects. Example: [{"title": "Article 1", "url": "Link 1"}, {"title": "Article 2", "url": "Link 2"}].';

  const completion = await groq.chat.completions.create({
    model: CURATOR_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Trending headlines:\n${headlineList}` },
    ],
    temperature: 0.2,
    max_tokens: 600,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);
  const items = extractArrayFromPayload(parsed)
    .map((item: any): CuratedArticle => ({
      title: String(item?.title || "").trim(),
      url: String(item?.url || "").trim(),
    }))
    .filter((item) => item.title && item.url && isValidUrl(item.url))
    .slice(0, 3);

  if (items.length < 2) {
    throw new Error("Curator did not return at least 2 valid URLs");
  }

  return items.map((item) => item.url);
}

