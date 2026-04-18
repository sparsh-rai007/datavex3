import { apiClient } from '@/lib/api';
import BlogBrutalistList from '@/components/BlogBrutalistList';
import PublicWrapper from '../wrapper';

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
    // Fetch production blog matrix from the API
    blogs = await apiClient.getPublicBlogs();
  } catch (error) {
    console.error("Blog retrieval error:", error);
  }

  // Utility to strip HTML tags for excerpt generation
  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };

  // Map API response accurately into the strict interface demanded by the brutalist visual design
  const mappedBlogs = blogs.map(blog => {
    const rawContent = blog.content || '';
    const plainText = stripHtml(rawContent);
    const hasExternalUrl = !!(blog.external_url);
    
    // Determine the best available excerpt
    let finalExcerpt = blog.excerpt || '';
    
    if (!finalExcerpt && plainText) {
      finalExcerpt = plainText.substring(0, 180) + (plainText.length > 180 ? '...' : '');
    }
    
    if (!finalExcerpt && hasExternalUrl) {
      finalExcerpt = "External technical briefing from DATAVEX core — Access full documentation via the link below.";
    }
    
    if (!finalExcerpt) {
      finalExcerpt = "Architectural brief currently processing — Full record metadata pending system synchronization.";
    }

    return {
      id: blog.id || blog._id || Math.random().toString(),
      title: blog.title || 'Untitled Syntax',
      slug: blog.slug || '',
      excerpt: finalExcerpt,
      category: blog.category || 'Intelligence',
      author_name: blog.author || 'DATAVEX Architect',
      created_at: blog.created_at || new Date().toISOString(),
      featured_image: blog.featured_image || null,
      read_time: blog.read_time || '5 min',
      external_url: blog.external_url || null
    };
  });

  // Render the standalone brutalist layout inside the global site Navigation wrapper
  return (
    <PublicWrapper>
      <BlogBrutalistList blogs={mappedBlogs} />
    </PublicWrapper>
  );
}
