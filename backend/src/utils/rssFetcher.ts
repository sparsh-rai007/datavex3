import Parser from "rss-parser";

export interface RssHeadline {
  title: string;
  link: string;
}

const TOP_ITEMS_PER_FEED = 5;

const RSS_FEEDS: string[] = [
  "https://hnrss.org/frontpage",
  "https://techcrunch.com/category/artificial-intelligence/feed/",
  "https://dev.to/feed",
];

const parser = new Parser();

export async function fetchTrendingHeadlines(): Promise<{ headlines: RssHeadline[]; formattedText: string }> {
  const headlines: RssHeadline[] = [];

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const topItems = (feed.items || []).slice(0, TOP_ITEMS_PER_FEED);

      for (const item of topItems) {
        const title = String(item.title || "").trim();
        const link = String(item.link || "").trim();

        if (!title || !link) {
          continue;
        }

        headlines.push({ title, link });
      }
    } catch (error: any) {
      console.warn(`[RSS] Failed feed ${feedUrl}: ${error.message}`);
    }
  }

  const deduped = dedupeByLink(headlines).slice(0, 15);
  if (deduped.length === 0) {
    throw new Error("No RSS headlines available from configured feeds");
  }

  const formattedText = deduped
    .map((item, index) => `${index + 1}. ${item.title} - ${item.link}`)
    .join("\n");

  return { headlines: deduped, formattedText };
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
