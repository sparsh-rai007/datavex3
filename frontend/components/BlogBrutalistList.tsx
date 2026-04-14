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
  ArrowUpRight
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

const CATEGORIES = ['All Records', 'AI Strategy', 'Neural Systems', 'Security Protocol', 'Enterprise Synthesis', 'Tactical Analysis'];

export default function BlogBrutalistList({ blogs }: { blogs: BlogPost[] }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All Records');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBlogs = blogs.filter(post => {
    const searchCat = activeCategory === 'All Records' ? 'All' : activeCategory;
    const matchesCategory = activeCategory === 'All Records' || post.category === searchCat || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
    <div className="min-h-screen bg-[#fcfcfc] font-sans text-[#111]">


      <main className="max-w-7xl mx-auto px-6 py-20">
        {/* Editorial Hero */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end"
          >
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[10px] font-mono text-brand-600 uppercase tracking-[0.4em]">01 / Central Intelligence</span>
              </div>
              <h1 className="font-serif text-6xl md:text-8xl font-medium leading-[0.9] tracking-tight mb-0">
                Fresh <span className="italic">Stories &</span> Insights. 
              </h1>
            </div>
            <div className="lg:col-span-4 pb-2">
              <p className="text-base text-slate-600 font-medium leading-relaxed border-l-2 border-brand-600 pl-6">
                Deep architectural analysis and tactical intelligence for the next generation of AI-driven enterprises.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Featured Post - Editorial Style */}
        {currentPage === 1 && activeCategory === 'All Records' && !searchQuery && featuredPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-32"
          >
            <div
              onClick={() => handleReadMore(featuredPost)}
              className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              {featuredPost.featured_image && (
                <div className="lg:col-span-7 relative overflow-hidden">
                  <img
                    src={featuredPost.featured_image}
                    alt={featuredPost.title}
                    className="w-full aspect-[16/10] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 left-0 bg-white p-6 md:p-10 max-w-sm hidden md:block">
                    <div className="text-[10px] font-mono text-brand-600 uppercase tracking-widest mb-4">Featured Record</div>
                    <h3 className="font-serif text-2xl italic leading-tight">{featuredPost.title}</h3>
                  </div>
                </div>
              )}

              <div className={featuredPost.featured_image ? "lg:col-span-5" : "lg:col-span-12 max-w-4xl"}>
                <div className="flex items-center gap-4 mb-8 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  <span className="text-brand-600">{featuredPost.category || 'General'}</span>
                  <span>/</span>
                  <span>{featuredPost.read_time || '8 min'} read</span>
                </div>
                <h2 className={`font-serif font-medium mb-8 leading-tight tracking-tight transition-all ${featuredPost.title && featuredPost.title.length > 60 ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'}`}>
                  {featuredPost.title}
                </h2>
                <p className="text-slate-600 text-lg mb-10 leading-relaxed max-w-md line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between pt-8 border-t border-black/10">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">By</span>
                    <span className="text-xs font-bold uppercase tracking-widest">{featuredPost.author_name || 'System Architect'}</span>
                  </div>
                  <ArrowUpRight size={24} className="text-brand-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>
        )}



        {/* Linear Feed - Technical Grid */}
        <div className="grid grid-cols-1 gap-0 border-b border-black/10 mb-24">
          <AnimatePresence mode="popLayout">
            {paginatedBlogs.length === 0 ? (
              <div className="py-20 text-center font-mono uppercase tracking-widest text-slate-400 text-xs border-t border-black/10">No records found matching constraints.</div>
            ) : paginatedBlogs.map((post, index) => (
              <motion.article
                layout
                key={post.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                onClick={() => handleReadMore(post)}
                className="group cursor-pointer border-t border-black/10 py-12 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start px-2">
                  <div className="lg:col-span-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest pt-2">
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>

                  <div className={post.featured_image ? "lg:col-span-7" : "lg:col-span-10"}>
                    <div className="text-[10px] font-mono text-brand-600 uppercase tracking-widest mb-4">
                      {post.category || 'General'}
                    </div>
                    <h3 className={`font-serif font-medium mb-6 leading-tight tracking-tight transition-all ${post.title && post.title.length > 60 ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'}`}>
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-base mb-8 line-clamp-2 leading-relaxed max-w-2xl">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Authored by</span>
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">{post.author_name || 'System Architect'}</span>
                    </div>
                  </div>

                  {post.featured_image && (
                    <div className="lg:col-span-3">
                      <div className="aspect-[4/3] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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

        {/* Pagination - Minimal */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mb-32">
            <button
              onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo(0, 0); }}
              disabled={currentPage === 1}
              className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 disabled:opacity-30 hover:text-brand-600 transition-all"
            >
              <ChevronRight size={14} className="rotate-180" /> Previous
            </button>
            <div className="flex items-center gap-6">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentPage(i + 1); window.scrollTo(0, 0); }}
                  className={`text-[10px] font-mono uppercase tracking-widest ${currentPage === i + 1 ? 'text-brand-600 font-bold underline underline-offset-4' : 'text-slate-400 hover:text-black'
                    }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo(0, 0); }}
              disabled={currentPage === totalPages}
              className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 disabled:opacity-30 hover:text-brand-600 transition-all"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Newsletter - Brutalist Style */}
        <section className="border-2 border-black p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <Zap size={48} className="text-brand-600 opacity-20" />
          </div>
          <div className="max-w-3xl">
            <div className="text-[10px] font-mono text-brand-600 uppercase tracking-[0.4em] mb-8">Newsletter Synchronization</div>
            <h2 className="font-serif text-5xl md:text-7xl font-medium mb-12 leading-[0.95] tracking-tight">
              Authority Through <span className="italic">Synthesis</span>.
            </h2>
            <p className="text-slate-600 text-lg md:text-xl mb-16 leading-relaxed flex items-center gap-3">
              Join 5,000+ enterprise architects receiving our bi-weekly neural synthesis on AI strategy and technical automation.
            </p>
            <form className="flex flex-col sm:flex-row gap-0 border-b border-black">
              <input
                type="email"
                placeholder="EMAIL@ADDRESS.COM"
                className="flex-grow py-6 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-xs tracking-widest"
                required
              />
              <button className="bg-black text-white px-12 py-6 font-mono uppercase tracking-widest text-xs hover:bg-brand-600 transition-all">
                Synchronize
              </button>
            </form>
          </div>
        </section>
      </main>


    </div>
  );
}
