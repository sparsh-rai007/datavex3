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
  Search,
  User,
  Mail,
  ArrowUpRight,
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



export default function BlogBrutalistList({ blogs }: { blogs: BlogPost[] }) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBlogs = blogs.filter(post => {
    return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const POSTS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const featuredPost = filteredBlogs[0];

  const handleReadMore = (post: BlogPost) => {
    if (post.external_url) {
      window.open(post.external_url, '_blank');
    } else {
      router.push(`/blog/${post.slug}`);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white min-h-[90vh] font-sans selection:bg-primary-600/20 text-slate-800">

      {/* Subtle grid background pattern matching the Home Page */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>

      {/* Glowing blur effects matching the Home Page */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>

      <main className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        {/* Editorial Hero Redesigned */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end"
          >
            <div className="lg:col-span-8 text-left">
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-0">
                Fresh{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
                  Stories & Insights
                </span>.
              </h1>
            </div>
            <div className="lg:col-span-4 pb-2 text-left">
              <p className="text-base text-slate-600 font-normal leading-relaxed border-l-2 border-primary-500 pl-6">
                Deep architectural analysis and tactical intelligence for the next generation of AI-driven enterprises.
              </p>
            </div>
          </motion.div>
        </div>

        

        {/* Featured Post - Redesigned Premium Style */}
        {currentPage === 1 && !searchQuery && featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-24"
          >
            <div
              onClick={() => handleReadMore(featuredPost)}
              className="group cursor-pointer relative bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-200/80 hover:border-primary-100 shadow-xl shadow-primary-500/5 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 p-8 md:p-10 flex flex-col lg:grid lg:grid-cols-12 gap-10 items-center hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/5 to-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              {featuredPost.featured_image && (
                <div className="lg:col-span-7 w-full overflow-hidden rounded-2xl border border-slate-100 relative shadow-sm">
                  <img
                    src={featuredPost.featured_image}
                    alt={featuredPost.title}
                    className="w-full aspect-[16/10] object-cover transition-transform duration-1000 group-hover:scale-103"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 left-0 bg-slate-950/80 backdrop-blur-sm text-white p-6 max-w-sm rounded-tr-2xl border-t border-r border-slate-800 hidden md:block text-left">
                    <div className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider mb-2 font-bold">Featured Record</div>
                    <h3 className="text-xl font-bold leading-tight line-clamp-2">{featuredPost.title}</h3>
                  </div>
                </div>
              )}

              <div className={`${featuredPost.featured_image ? "lg:col-span-5" : "lg:col-span-12 max-w-4xl"} w-full text-left space-y-6`}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary-500 bg-primary-50 border border-primary-100/50 rounded-lg px-2.5 py-1 flex items-center gap-1.5 w-fit">
                  <Calendar size={12} className="text-primary-500" />
                  <span>{featuredPost.category || 'General'}</span>
                </div>

                <h2 className="font-sans font-extrabold text-slate-900 leading-tight tracking-tight group-hover:text-primary-600 transition-colors text-3xl md:text-4xl line-clamp-3">
                  {featuredPost.title}
                </h2>

                <p className="text-slate-600 text-base leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">By</span>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">{featuredPost.author_name || 'System Architect'}</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all shadow-sm">
                    <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Linear Feed - Redesigned Cards List */}
        <div className="space-y-6 mb-20 text-left">
          <AnimatePresence mode="popLayout">
            {paginatedBlogs.length === 0 ? (
              <div className="py-20 text-center font-bold uppercase tracking-widest text-slate-400 text-xs bg-white border border-slate-200 rounded-3xl shadow-sm">
                No records found matching constraints.
              </div>
            ) : paginatedBlogs.map((post, index) => (
              <motion.article
                layout
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => handleReadMore(post)}
                className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/80 hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-500/10 p-6 md:p-8 hover:-translate-y-0.5 transition-all duration-300 relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start relative z-10 w-full">

                  {/* Date column */}
                  <div className="lg:col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pt-1">
                    <Calendar size={12} className="text-slate-400" />
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  {/* Title & Info column */}
                  <div className={post.featured_image ? "lg:col-span-7 w-full space-y-4" : "lg:col-span-10 w-full space-y-4"}>
                    <div className="text-[10px] font-bold text-primary-600 uppercase tracking-widest bg-primary-50/50 border border-primary-100/50 rounded-lg px-2.5 py-1 flex items-center gap-1.5 w-fit">
                      <span>{post.category || 'General'}</span>
                    </div>

                    <h3 className="font-sans font-extrabold text-slate-900 group-hover:text-primary-600 transition-colors text-2xl md:text-3xl leading-snug line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed max-w-2xl line-clamp-2 font-normal">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Authored by</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-800">{post.author_name || 'System Architect'}</span>
                    </div>
                  </div>

                  {/* Image column */}
                  {post.featured_image && (
                    <div className="lg:col-span-3 w-full">
                      <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-103"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination - Minimal Premium */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mb-24">
            <button
              onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo(0, 200); }}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ChevronRight size={14} className="rotate-180" /> Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 200); }}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === i + 1
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo(0, 200); }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-primary-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}

        
      </main>
    </div>
  );
}
