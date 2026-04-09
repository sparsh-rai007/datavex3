import PublicWrapper from '../wrapper';
import { apiClient } from '@/lib/api';
import NewsletterListClient from '@/components/NewsletterListClient';

// Force SSR so blogs are always fetched fresh — without this, Next.js statically
// generates this page at build time and production shows stale data forever.
export const dynamic = 'force-dynamic';

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
      <NewsletterListClient 
        blogs={blogs} 
        basePath="/blog" 
        title={
          <>
            Insights for the Modern Web <span className="text-primary-600"></span><span className="text-primary-600"></span>  <span className="text-primary-600"></span>.
          </>
        }
        subtitle="The definitive guide for enterprise leaders navigating the synthesis of neural architectures and high-velocity systems."
      />
    </PublicWrapper>
  );
}
