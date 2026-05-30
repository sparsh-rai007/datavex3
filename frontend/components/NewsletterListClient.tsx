'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Shield,
  Zap,
  Cpu,
  Binary,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author_name: string;
  created_at: string;
  featured_image?: string;
  read_time?: string;
  external_url?: string;
}

export default function NewsletterListClient({ blogs }: { blogs: BlogPost[] }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const basePath = '/newsletter';

  const POSTS_PER_PAGE = 6;
  const featuredPost = blogs[0];

  const totalPages = Math.ceil(blogs.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedBlogs = blogs.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handleReadMore = (post: BlogPost) => {
    if (post.external_url) {
      window.open(post.external_url, '_blank');
    } else {
      router.push(`${basePath}/${post.slug}`);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white min-h-[90vh] font-sans selection:bg-primary-600/20">
      
      {/* Subtle grid background pattern matching the Home Page */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
      
      {/* Glowing blur effects matching the Home Page */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>

      <main className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Branded Header matching the Home Page */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-4xl text-left"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
                Today's{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
                  Key Updates
                </span>{" "}
                at a glance
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl font-normal">
                Deep architectural analysis and tactical intelligence for the next generation of AI-driven enterprises.
              </p>
            </motion.div>
          </div>

          {/* Featured Edition - Only on Page 1 - Redesigned Premium Style */}
          {currentPage === 1 && featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-24 max-w-5xl mx-auto"
            >
              <div
                onClick={() => handleReadMore(featuredPost)}
                className="group cursor-pointer relative bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-200/80 hover:border-primary-100 shadow-xl shadow-primary-500/5 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 p-8 md:p-14 flex flex-col items-center hover:-translate-y-1 text-center"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary-500/5 to-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col justify-center max-w-4xl mx-auto items-center relative z-10">
                  
                  {/* Category Pill */}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600 px-3.5 py-1 bg-primary-50 border border-primary-100/50 rounded-full mb-6 block">
                    {featuredPost.category || "Featured Edition"}
                  </span>
                  
                  <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 group-hover:text-primary-600 transition-colors leading-[1.15] tracking-tight">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-slate-600 text-base md:text-lg mb-10 leading-relaxed max-w-3xl line-clamp-3 font-normal">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between w-full pt-8 border-t border-slate-100 max-w-2xl">
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] tracking-wider uppercase font-bold">
                      <Calendar size={14} className="text-primary-500/70" />
                      <span>{new Date(featuredPost.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <button className="flex items-center gap-2 text-primary-600 font-extrabold uppercase tracking-widest text-xs group-hover:gap-3 transition-all cursor-pointer">
                      Read Edition <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Synthesis Archive Feed - Card layouts matching solutions overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-20">
            <AnimatePresence mode="popLayout">
              {paginatedBlogs.map((post, index) => (
                <motion.article
                  layout
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.05 }}
                  onClick={() => handleReadMore(post)}
                  className="group cursor-pointer bg-white rounded-3xl border border-slate-200 hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 flex flex-col p-8 md:p-9 hover:-translate-y-1 relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col flex-grow relative z-10">
                    
                    {/* Publication Date Badge */}
                    <div className="text-[10px] font-bold text-primary-500 uppercase tracking-widest bg-primary-50 border border-primary-100/50 rounded-lg px-2.5 py-1 flex items-center gap-1.5 w-fit">
                      <Calendar size={12} className="text-primary-500" />
                      <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-6 mb-4 group-hover:text-primary-600 transition-colors leading-[1.25] tracking-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 font-normal line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read Edition <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all shadow-sm">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Controls - Modern style */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-16 pb-12">
              <button
                onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo(0, 400); }}
                disabled={currentPage === 1}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary-600 hover:border-primary-300 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <ChevronRight size={14} className="rotate-180" /> Previous
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 400); }}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === i + 1
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                      : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo(0, 400); }}
                disabled={currentPage === totalPages}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary-600 hover:border-primary-300 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Empty Records State - Sleek Redesigned visual */}
          {paginatedBlogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-28 bg-white/70 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 max-w-4xl mx-auto shadow-sm"
            >
              <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Binary size={36} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Archive Empty</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed font-normal mb-8">
                No intelligence records have been synchronized to the core yet. Check back later.
              </p>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
