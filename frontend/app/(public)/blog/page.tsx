import PublicWrapper from '../wrapper';
import { apiClient } from '@/lib/api';
import NewsletterListClient from '@/components/NewsletterListClient';

export const metadata = {
  title: 'Blog Archive — DATAVEX.ai',
  description: 'Access the complete archive of technical articles, briefings, and architectural updates from the DATAVEX core.',
};

export default async function BlogPage() {
  let blogs: any[] = [];

  try {
    // Reverted backend returns everything from /public/all
    blogs = await apiClient.getPublicBlogs();  
  } catch (error) {
    console.error("Blog retrieval error:", error);
  }

  return (
    <PublicWrapper>
      <NewsletterListClient blogs={blogs} />
    </PublicWrapper>
  );
}
