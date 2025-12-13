'use client';

import { useEffect, useState } from 'react';

export default function RecentArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on client - this prevents Next.js from detecting the fetch during build
    if (typeof window === 'undefined') {
      return;
    }
    
    setMounted(true);
    
    // Use setTimeout to ensure this runs only after component is fully mounted
    // This prevents Next.js from detecting the fetch during static generation
    const timer = setTimeout(() => {
      const loadArticles = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL;
          if (!apiUrl) return;
          
          const response = await fetch(`${apiUrl}/api/blogs/latest`);
          if (response.ok) {
            const data = await response.json();
            setArticles(data);
          }
        } catch (error) {
          console.error('Failed to load latest articles:', error);
          setArticles([]);
        }
      };
      
      loadArticles();
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <section className="pt-4 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tight">
            Recent Articles
          </h2>
          <p className="text-center text-gray-500">Loading articles...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-4 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent tracking-tight">
          Recent Articles
        </h2>

        {articles.length === 0 ? (
          <p className="text-center text-gray-500">No articles available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article: any) => (
              <a
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5"
              >
                <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <span className="text-primary-600 font-medium">Read More →</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

