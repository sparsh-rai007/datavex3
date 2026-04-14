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
  Binary
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
    <div className="min-h-screen bg-[#fcfcfc] font-sans selection:bg-primary-600/20">
      <main className="py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Branded Header */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-6">
              
                 </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium text-slate-900 mb-8 tracking-tight leading-[1.1] md:leading-[1.05]">
                Today's <span className="italic">Synthetic</span> Briefing Core
              </h1>
              <p className="text-lg md:text-xl text-slate-600 font-serif italic leading-relaxed max-w-3xl">
                Deep architectural analysis and tactical intelligence for the next generation of AI-driven enterprises.
              </p>
            </motion.div>
          </div>

          {/* Featured Edition - Only on Page 1 */}
          {currentPage === 1 && featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-20 max-w-4xl mx-auto"
            >
              <div
                onClick={() => handleReadMore(featuredPost)}
                className="group cursor-pointer relative bg-[#fcfcfc] rounded-sm overflow-hidden border border-slate-100 shadow-xl shadow-slate-900/5 p-6 md:p-10"
              >
                <div className="flex flex-col justify-center max-w-3xl mx-auto text-center items-center">
                  <div className="flex items-center gap-4 mb-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 justify-center">
                    <span className="text-primary-600 px-3 py-1 bg-slate-50 rounded-full">{featuredPost.category || "General Briefing"}</span>
                  </div>
                  <h2 className="text-3xl lg:text-5xl font-serif font-medium text-slate-900 mb-6 group-hover:text-primary-600 transition-colors leading-[1.1] tracking-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-600 font-serif italic text-base lg:text-lg mb-10 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between w-full pt-8 border-t border-slate-100 max-w-xl">
                    <div className="flex items-center gap-4 py-2">
                    </div>
                    <button className="flex items-center gap-3 text-primary-600 font-bold uppercase tracking-[0.2em] text-[10px] group-hover:translate-x-2 transition-transform">
                      Read  <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}


          {/* Synthesis Archive Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
            <AnimatePresence mode="popLayout">
              {paginatedBlogs.map((post, index) => (
                <motion.article
                  layout
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                  onClick={() => handleReadMore(post)}
                  className="group cursor-pointer bg-[#fcfcfc] rounded-sm border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] transition-all duration-700 flex flex-col"
                >
                  <div className="p-10 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 mb-8 text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><TrendingUp size={14} className="text-primary-600/50" /> {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-2xl font-serif font-medium text-slate-900 mb-6 group-hover:text-primary-600 transition-colors leading-[1.2] tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 font-serif italic text-base mb-10 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-8 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                      </div>
                      <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all shadow-sm">
                        <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12 pb-20">
              <button
                onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo(0, 500); }}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-[#fcfcfc] border border-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm flex items-center gap-2"
              >
                <ChevronRight size={16} className="rotate-180" /> Previous System
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 500); }}
                    className={`w-10 h-10 rounded-full text-[10px] font-bold transition-all ${currentPage === i + 1
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'bg-[#fcfcfc] text-slate-400 hover:text-slate-900 border border-slate-100'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo(0, 500); }}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-[#fcfcfc] border border-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm flex items-center gap-2"
              >
                Next System <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Empty Records State */}
          {paginatedBlogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-40 bg-[#fcfcfc] rounded-sm border-2 border-dashed border-slate-100"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Binary size={40} className="text-slate-100" />
              </div>
              <h3 className="text-3xl font-serif italic text-slate-900 mb-4 tracking-tight">Archive Empty</h3>
              <p className="text-slate-400 font-serif italic max-w-sm mx-auto leading-relaxed mb-12">
                No intelligence records have been synchronized to the core yet. Check back later.
              </p>
            </motion.div>
          )}

          {/* Future Subscription Matrix */}
          <section className="mt-48 relative rounded-sm overflow-hidden group shadow-[0_60px_120px_-20px_rgba(0,0,0,0.1)]">
            <div className="absolute inset-0 bg-slate-900">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#5a5a40 2px, transparent 2px)', backgroundSize: '60px 60px' }}></div>
              <div className="absolute -top-1/2 -right-1/4 w-[80%] h-full bg-primary-600/10 blur-[200px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            </div>
            <div className="relative px-10 py-32 md:p-32 text-center max-w-5xl mx-auto z-10">
              <div className="flex justify-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform"><Cpu size={24} /></div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform delay-75"><Zap size={24} /></div>
              </div>
              <h2 className="text-5xl md:text-7xl font-serif italic text-white mb-10 tracking-tight leading-[0.95]">Authority Through <span className="text-primary-600">Synthesis</span>.</h2>
              <p className="text-white/60 text-xl font-serif italic mb-16 leading-relaxed max-w-3xl mx-auto">
                Join 5,000+ enterprise architects receiving our bi-weekly neural synthesis on AI strategy and technical automation.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto bg-white/5 p-3 rounded-full backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
                <input
                  type="email"
                  placeholder="Official Work Intelligence Address"
                  className="flex-grow px-10 py-6 rounded-full bg-transparent text-white placeholder:text-white/20 focus:outline-none focus:ring-4 focus:ring-primary-600/10 transition-all font-bold uppercase tracking-widest text-[10px]"
                  required
                />
                <button className="bg-primary-600 text-white px-12 py-6 rounded-full font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-primary-600/30 active:scale-95">
                  Synchronize
                </button>
              </form>
              <div className="mt-12 flex items-center justify-center gap-8 py-6 border-t border-white/5 max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Archive Online</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-600" />
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Protocol Secured</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
