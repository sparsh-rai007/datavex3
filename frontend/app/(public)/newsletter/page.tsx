export const dynamic = "force-dynamic";

import PublicWrapper from '../wrapper';
import { apiClient } from '@/lib/api';
import NewsletterListClient from '@/components/NewsletterListClient';

export const metadata = {
  title: 'Insights Synthesis Matrix — DATAVEX.ai',
  description: 'Synchronize with the latest articles, neural strategy, and architectural updates from the DATAVEX.ai intelligence core.',
};

export default async function BlogPage() {
  // Fetch real-time architectural records from backend authority
  let blogs: any[] = [];

  try {
    const newsletters = await apiClient.getPublicNewsletters();
    blogs = (newsletters || []).map((n: any) => {
      const plain = String(n?.content || "").replace(/[#>*`_\-\[\]\(\)]/g, " ").replace(/\s+/g, " ").trim();
      return {
        id: String(n.id),
        title: n.title || "Untitled Newsletter",
        slug: String(n.id),
        excerpt: plain.slice(0, 180) || "Daily technical newsletter briefing.",
        category: "Daily Newsletter",
        author_name: "DataVex Editorial",
        created_at: n.created_at,
        featured_image: undefined,
      };
    });
  } catch (error) {
    console.error("Critical Failure: Intelligence retrieval error:", error);
  }

  return (
    <PublicWrapper>
      <NewsletterListClient blogs={blogs} />
    </PublicWrapper>
  );
}
