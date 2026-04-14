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

  // Map API response accurately into the strict interface demanded by the brutualist visual design
  const mappedBlogs = blogs.map(blog => ({
    id: blog.id || blog._id || Math.random().toString(),
    title: blog.title || 'Untitled Syntax',
    slug: blog.slug || '',
    excerpt: blog.excerpt || (blog.content ? blog.content.substring(0, 150) + '...' : 'Data excerpt unavailable.'),
    category: blog.category || 'General',
    author_name: blog.author || 'DATAVEX Architect',
    created_at: blog.created_at || new Date().toISOString(),
    featured_image: blog.featured_image || null,
    read_time: blog.read_time || '5 min',
    external_url: blog.external_url || null
  }));

  // Render the standalone brutalist layout inside the global site Navigation wrapper
  return (
    <PublicWrapper>
      <BlogBrutalistList blogs={mappedBlogs} />
    </PublicWrapper>
  );
}
