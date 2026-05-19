'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api';
import PublicWrapper from '../wrapper';
import CustomFooter from '@/components/CustomFooter';

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

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

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(filter.toLowerCase()) ||
    job.department?.toLowerCase().includes(filter.toLowerCase()) ||
    job.location?.toLowerCase().includes(filter.toLowerCase())
  );

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
      <div className="flex flex-col min-h-screen">
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white pt-32 pb-4">
          {/* Subtle grid background pattern */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
          
          {/* Glowing blur effects */}
          <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"></div>
          <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
                Join Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">Team</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-2 font-normal">
              We're building the future of AI-powered marketing. If you're passionate about technology, innovation, and making an impact, we'd love to hear from you. </p>
            </motion.div>
          </div>
        </section>
        {/* Jobs Grid */}
        <section className="pt-4 pb-16 bg-white flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job, idx) => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link
                        href={`/careers/${job.slug}`}
                        className="group relative bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col h-full block"
                      >
                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                          <Briefcase className="w-6 h-6" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">{job.title}</h3>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                          {job.department && (
                            <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold tracking-wide border border-slate-100 uppercase">{job.department}</span>
                          )}
                          {job.location && (
                            <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold tracking-wide border border-slate-100 uppercase text-center">{job.location}</span>
                          )}
                        </div>

                        <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3">
                          {job.description?.substring(0, 150) || job.summary?.substring(0, 150)}...
                        </p>

                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-primary-600 font-bold text-sm">
                            Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                          {job.type && (
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{job.type}</span>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-24 text-center">
                    <h3 className="text-xl font-bold mb-2">No roles found</h3>
                    <p className="text-slate-500">Try adjusting your filters or check back later.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
      <CustomFooter />
    </PublicWrapper>
  );
}
