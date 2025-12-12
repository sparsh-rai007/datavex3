import { apiClient } from '@/lib/api';
import PublicWrapper from '../../wrapper';
import { redirect } from 'next/navigation';  // <-- ADD THIS

interface BlogPageProps {
  params: {
    slug: string;
  };
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = params;

  const blog = await apiClient.getPublicBlog(slug).catch(() => null);

  if (!blog) {
    return (
      <PublicWrapper>
        <div className="py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
          <p className="text-gray-600">This article does not exist.</p>
        </div>
      </PublicWrapper>
    );
  }

  // ⭐⭐⭐ ADD THIS BLOCK ⭐⭐⭐
  // If blog has external link, redirect instead of showing internal page
  if (blog.external_url) {
    redirect(blog.external_url);
  }
  // ⭐⭐⭐ END ⭐⭐⭐

  return (
    <PublicWrapper>
      <div className="max-w-4xl mx-auto px-6 py-20">

        {/* Category */}
        <div className="text-primary-600 font-medium uppercase tracking-wide text-sm mb-3">
          {blog.category || "Article"}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          {blog.title}
        </h1>

        {/* Meta Info */}
        <div className="text-gray-500 text-sm flex gap-3 mb-12">
          <span>{new Date(blog.created_at).toLocaleDateString()}</span>
          {blog.author_name && <>• <span>{blog.author_name}</span></>}
        </div>

        {/* Featured Image */}
        {blog.featured_image && (
          <img
            src={blog.featured_image}
            alt="Blog cover"
            className="rounded-xl mb-12 w-full max-h-[450px] object-cover shadow-lg"
          />
        )}

        {/* Article Content */}
        <article
          className="prose prose-lg max-w-none prose-headings:font-semibold prose-a:text-primary-600 prose-blockquote:border-l-primary-600"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Footer Bar */}
        <div className="mt-16 border-t pt-6 text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} DATAVEX.ai — All Rights Reserved.</p>
        </div>

      </div>
    </PublicWrapper>
  );
}
