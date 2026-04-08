import { pool } from "../db/connection";
import { fetchTrendingHeadlines } from "../utils/rssFetcher";
import { curateTopTrendUrls } from "./curator";
import { generateAIText } from "./aiTextGenerator";

export const cronStatus = {
  isRunning: false,
  lastRunTimestamp: null as Date | null,
  lastError: null as string | null,
};

let lastErrorTimestamp: Date | null = null;
const RECENT_ERROR_WINDOW_MS = 24 * 60 * 60 * 1000;

export function hasRecentCronError(): boolean {
  if (!cronStatus.lastError || !lastErrorTimestamp) {
    return false;
  }
  return Date.now() - lastErrorTimestamp.getTime() <= RECENT_ERROR_WINDOW_MS;
}

const NEWSLETTER_SYSTEM_PROMPT =
  "You are an expert technical writer. Write a cohesive, deep-dive technical newsletter about a single trending topic, using the provided source articles as context. Do NOT just summarize the articles. Synthesize the information into a single, comprehensive blog post. Start with a strong hook. Apply our strict 'Anti-Robot' tone rules. End each main section with a blockquote reference: > Source: [Title](URL).";

export async function runDailyNewsletter() {
  cronStatus.isRunning = true;
  try {
    const { formattedText, headlines } = await fetchTrendingHeadlines();

    const curatedUrls = await curateTopTrendUrls(formattedText);

    const safeUrls = curatedUrls.filter((url) =>
      headlines.some((headline) => headline.link === url)
    );

    if (safeUrls.length < 2) {
      throw new Error("Curator returned insufficient URLs from fetched RSS set");
    }

    const generated = await generateAIText(safeUrls.slice(0, 3), NEWSLETTER_SYSTEM_PROMPT);

    const result = await pool.query(
      `INSERT INTO newsletters (title, content, status, sent_at)
       VALUES ($1, $2, 'published', NOW())
       RETURNING *`,
      [generated.title, generated.content]
    );

    cronStatus.lastRunTimestamp = new Date();
    cronStatus.lastError = null;
    lastErrorTimestamp = null;

    return result.rows[0];
  } catch (error: any) {
    cronStatus.lastError = error?.message || "Unknown newsletter cron error";
    lastErrorTimestamp = new Date();
    throw error;
  } finally {
    cronStatus.isRunning = false;
  }
}

// Backward-compatible export for existing routes.
export async function generateDailyNewsletter(_options?: { keyword?: string }) {
  return runDailyNewsletter();
}
