'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import PublicWrapper from '../wrapper'; // ✅ Added wrapper import

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await apiClient.getJobs({ status: 'published' });
      setJobs(data.jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PublicWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PublicWrapper>
    );
  }

  return (
    <PublicWrapper>
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Join Our Team</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the future of AI-powered marketing. If you're passionate
              about technology, innovation, and making an impact, we'd love to hear from you.
            </p>
          </div>

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/careers/${job.slug}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {job.title}
                  </h2>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.location && (
                      <span className="text-sm text-gray-600">{job.location}</span>
                    )}

                    {job.type && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                        {job.type}
                      </span>
                    )}

                    {job.department && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {job.department}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-3">
                    {job.description?.substring(0, 150)}...
                  </p>

                  <div className="mt-4 text-primary-600 font-medium text-sm">
                    Learn More →
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No open positions at the moment.
              </p>

              <p className="text-gray-600">
                Check back soon or{' '}
                <Link href="/contact" className="text-primary-600 hover:text-primary-700">
                  contact us
                </Link>{' '}
                to be considered for future opportunities.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicWrapper>
  );
}
