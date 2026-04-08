import { pool } from "../db/connection";
import { fetchTrendingHeadlines } from "../utils/rssFetcher";
import { curateTopTrendUrls } from "./curator";
import { generateFromUrl } from "./blogGenerator";

export const blogCronStatus = {
  isRunning: false,
  lastRunTimestamp: null as Date | null,
  lastError: null as string | null,
};

function slugify(text: string): string {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 200);
}

export async function runScheduledBlogGeneration() {
  blogCronStatus.isRunning = true;

  try {
    const { formattedText, headlines } = await fetchTrendingHeadlines();
    const curatedUrls = await curateTopTrendUrls(formattedText);

    const safeUrls = curatedUrls.filter((url) =>
      headlines.some((headline) => headline.link === url)
    );

    const sourceUrl = safeUrls[0] || headlines[0]?.link;
    if (!sourceUrl) {
      throw new Error("No valid source URL available for scheduled blog generation");
    }

    const generated = await generateFromUrl(sourceUrl, "human");
    const slug = `${slugify(generated.title) || "ai-blog"}-${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO blogs (
        title,
        slug,
        content,
        status,
        generation_method,
        source_reference,
        author_id
      )
      VALUES ($1, $2, $3, 'published', $4, $5, $6)
      RETURNING *`,
      [
        generated.title,
        slug,
        generated.content,
        generated.generationMethod,
        generated.sourceReference,
        null,
      ]
    );

    blogCronStatus.lastRunTimestamp = new Date();
    blogCronStatus.lastError = null;

    return result.rows[0];
  } catch (error: any) {
    blogCronStatus.lastError = error?.message || "Unknown blog cron error";
    throw error;
  } finally {
    blogCronStatus.isRunning = false;
  }
}
