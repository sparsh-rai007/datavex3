import Parser from "rss-parser";

export interface RssHeadline {
  title: string;
  link: string;
  source: string;
}

const TOP_ARTICLES_PER_FEED = 5;

const RSS_FEEDS: Array<{ name: string; url: string }> = [
  { name: "Hacker News", url: "https://hnrss.org/frontpage" },
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
  { name: "dev.to", url: "https://dev.to/feed" },
  { name: "The Verge Tech", url: "https://www.theverge.com/rss/tech/index.xml" },
];

/**
 * Fetches top headlines from curated RSS feeds and returns both structured items
 * and a numbered text block for downstream LLM prompts.
 */
export async function fetchTrendingHeadlines(): Promise<{
  items: RssHeadline[];
  numberedText: string;
}> {
  const parser = new Parser();
  const allHeadlines: RssHeadline[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const topItems = (parsed.items || []).slice(0, TOP_ARTICLES_PER_FEED);

      for (const item of topItems) {
        const title = (item.title || "").trim();
        const link = (item.link || "").trim();

        if (!title || !link) {
          continue;
        }

        allHeadlines.push({
          title,
          link,
          source: feed.name,
        });
      }
    } catch (error: any) {
      console.warn(`[RSS] Failed to parse ${feed.name}: ${error.message}`);
    }
  }

  if (allHeadlines.length === 0) {
    throw new Error("No RSS headlines could be fetched from configured feeds");
  }

  const deduped = dedupeByLink(allHeadlines);
  const numberedText = deduped
    .map((item, idx) => `${idx + 1}. [${item.source}] ${item.title} - ${item.link}`)
    .join("\n");

  return {
    items: deduped,
    numberedText,
  };
}

function dedupeByLink(items: RssHeadline[]): RssHeadline[] {
  const seen = new Set<string>();
  const output: RssHeadline[] = [];

  for (const item of items) {
    if (seen.has(item.link)) {
      continue;
    }
    seen.add(item.link);
    output.push(item);
  }

  return output;
}
