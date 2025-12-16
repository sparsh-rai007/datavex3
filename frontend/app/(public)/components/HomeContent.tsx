'use client';

import Link from 'next/link';
import PublicWrapper from '../wrapper';
import RecentArticles from './RecentArticles';

export default function HomeContent() {
  return (
    <PublicWrapper>
     

        {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-100 min-h-screen flex items-center">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Lead Generation
              <span className="text-primary-600 block mt-2">
                That Actually Works
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your business with intelligent automation, data-driven insights,
              and AI-powered marketing tools that generate real results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 text-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/solutions"
                className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 text-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white">
          {/* unchanged */}
        </section>

        <RecentArticles />

        {/* CTA */}
        <section className="py-20 bg-primary-600">
          {/* unchanged */}
        </section>

      
    </PublicWrapper>
  );
}
