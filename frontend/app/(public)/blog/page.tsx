export const dynamic = "force-dynamic";

import Link from 'next/link';
import PublicWrapper from '../wrapper';
import { apiClient } from '@/lib/api';

export const metadata = {
  title: 'Blog - DATAVEX.ai',
  description: 'Read the latest articles, insights, and updates from DATAVEX.ai.',
};

export default async function BlogPage() {
  // Fetch real blogs from backend
  let blogs: any[] = [];

  try {
    blogs = await apiClient.getPublicBlogs();  
  } catch (error) {
    console.error("Failed to load blogs:", error);
  }

  return (
    <PublicWrapper>
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Blog</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Insights, tips, and strategies to help you succeed with AI, automation, and scalable growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  
                  {/* Category */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-primary-600 uppercase">
                      {post.category || "Article"}
                    </span>
                    <time className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </time>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary-600">
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      By {post.author_name || "Admin"}
                    </span>
                    <Link
  href={post.external_url ? post.external_url : `/blog/${post.slug}`}
  target={post.external_url ? "_blank" : "_self"}
  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
>
  Read More →
</Link>

                  </div>

                </div>
              </article>
            ))}
          </div>

          {/* No Blogs Fallback */}
          {blogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No blog posts yet. Check back soon!</p>
            </div>
          )}

        </div>
      </div>
    </PublicWrapper>
  );
}

