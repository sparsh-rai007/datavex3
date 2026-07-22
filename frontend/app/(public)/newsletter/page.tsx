export const dynamic = "force-dynamic";

import PublicWrapper from '../wrapper';
import { apiClient } from '@/lib/api';
import NewsletterListClient from '@/components/NewsletterListClient';
import CustomFooter from '@/components/CustomFooter';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI & Tech Newsletter | Datavex AI Insights India',
  description: 'Subscribe to the Datavex AI newsletter for the latest in AI trends, data science insights, cloud computing news, and digital transformation strategies.',
  keywords: 'AI newsletter India, data science newsletter, AI trends, tech newsletter Mangalore, Datavex AI updates, digital transformation news',
  alternates: {
    canonical: 'https://datavex.ai/newsletter',
  },
  openGraph: {
    title: 'AI & Tech Newsletter | Datavex AI Insights India',
    description: 'Subscribe to the Datavex AI newsletter for the latest in AI trends, data science insights, cloud computing news, and digital transformation strategies.',
    url: 'https://datavex.ai/newsletter',
    type: 'website',
    images: ['https://datavex.ai/assets/og-newsletter.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI & Tech Newsletter | Datavex AI Insights India',
    description: 'Subscribe to the Datavex AI newsletter for the latest in AI trends, data science insights, cloud computing news, and digital transformation strategies.',
    images: ['https://datavex.ai/assets/og-newsletter.jpg'],
  },
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
        excerpt: plain.slice(0, 180) || "Weekly technical newsletter briefing.",
        category: "Weekly Newsletter",
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
      <CustomFooter />
    </PublicWrapper>
  );
}
