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
    blogs = await apiClient.getPublicBlogs();  
  } catch (error) {
    console.error("Critical Failure: Intelligence retrieval error:", error);
  }

  return (
    <PublicWrapper>
      <NewsletterListClient blogs={blogs} />
    </PublicWrapper>
  );
}
