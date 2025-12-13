export const dynamic = "force-dynamic";

import Link from 'next/link';
import PublicWrapper from './wrapper'; // ✅ added wrapper import
async function getLatestArticles() {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/blogs/latest`;
    console.log("Fetching blogs from:", url);

    const res = await fetch(url, { next: { revalidate: 60 } });


    if (!res.ok) {
      console.error("Blog fetch failed:", res.status);
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to load latest articles:", error);
    return [];
  }
}



export const metadata = {
  title: 'DATAVEX.ai - AI-Powered Lead Generation Platform',
  description:
    'Transform your business with AI-powered lead generation, marketing automation, and intelligent analytics.',
};

export default async function Home() {
  const articles = await getLatestArticles();
    // Fetch posts from backend
  return (
    <PublicWrapper> 

      <>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-50 via-white to-primary-100 py-20">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                AI-Powered Lead Generation
                <span className="text-primary-600 block mt-2">
                  That Actually Works
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Transform your business with intelligent automation,
                data-driven insights, and AI-powered marketing tools that
                generate real results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/solutions"
                  className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-lg"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Grow
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Powerful features designed to help you generate leads, nurture
                relationships, and convert prospects into customers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI-Powered Automation
                </h3>
                <p className="text-gray-600">
                  Automate your lead generation and marketing workflows with
                  intelligent AI agents that learn and adapt to your business
                  needs.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Advanced Analytics
                </h3>
                <p className="text-gray-600">
                  Get deep insights into your marketing performance with
                  real-time analytics, conversion tracking, and predictive
                  modeling.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Lead Management
                </h3>
                <p className="text-gray-600">
                  Organize, score, and nurture your leads with intelligent
                  tagging, automated workflows, and CRM integrations.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
<section className="py-20 bg-white">
  ...
</section>

{/* 📚 Recent Articles Section — INSERT HERE */}
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


{/* CTA Section */}
<section className="py-20 bg-primary-600">
  ...
</section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of businesses using DATAVEX.ai to generate more
              leads and grow their revenue.
            </p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Start Free Trial
            </Link>
          </div>
        </section>
      </>
   

    </PublicWrapper> 
  );
}
