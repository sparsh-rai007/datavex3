'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Calendar, 
  Search, 
  ChevronRight,
  TrendingUp,
  Clock
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

interface BlogListClientProps {
  blogs: BlogPost[];
}

const CATEGORIES = ['All', 'AI Strategy', 'Automation', 'Security', 'Infrastructure', 'AI Trends'];

export default function BlogListClient({ blogs }: BlogListClientProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBlogs = blogs.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogs[0];

  const handleReadMore = (post: BlogPost) => {
    if (post.external_url) {
      window.open(post.external_url, '_blank');
    } else {
      router.push(`/blog/${post.slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-outfit">
      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                Insights for the <span className="text-primary-600">AI-First</span> Enterprise
              </h1>
              <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
                Deep dives into automation, machine learning, and the strategies driving the next generation of scalable growth.
              </p>
            </motion.div>
          </div>

          {/* Featured Post */}
          {activeCategory === 'All' && !searchQuery && featuredPost && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-20"
            >
              <div 
                onClick={() => handleReadMore(featuredPost)}
                className="group cursor-pointer relative grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/50"
              >
                <div className="relative h-64 lg:h-full overflow-hidden">
                  <img 
                    src={featuredPost.featured_image || "https://picsum.photos/seed/ai-future/800/600"} 
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/95 backdrop-blur px-4 py-2 rounded-2xl text-[10px] font-black text-primary-700 uppercase tracking-widest flex items-center gap-2 shadow-xl border border-slate-50">
                      <TrendingUp size={14} />
                      Featured Strategy
                    </span>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="text-primary-600">{featuredPost.category || "AI Trends"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {featuredPost.read_time || "8 Min Read"}</span>
                  </div>
                  <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 group-hover:text-primary-600 transition-colors leading-[1.1] tracking-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-500 font-medium text-lg mb-8 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-slate-900/20">
                        {featuredPost.author_name?.charAt(0) || "D"}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{featuredPost.author_name || "DataVex Intel"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(featuredPost.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-[10px] hover:gap-4 transition-all">
                      Extract Full Intel <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 md:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    activeCategory === cat 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-primary-100 hover:text-primary-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Search Strategic Intelligence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-80 pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-[1.2rem] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredBlogs.map((post, index) => (
                <motion.article
                  layout
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => handleReadMore(post)}
                  className="group cursor-pointer bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700 flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={post.featured_image || `https://picsum.photos/seed/related-${index}/600/400`} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-5 left-5">
                      <span className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] border border-slate-50">
                        {post.category || "Intel"}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar size={13} /> {new Date(post.created_at).toLocaleDateString()}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="flex items-center gap-1.5 text-primary-600/50"><Clock size={13} /> {post.read_time || "4 Min"}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 font-medium text-sm mb-8 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all">
                          {post.author_name?.charAt(0) || "D"}
                        </div>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-80">{post.author_name || "DataVex Analyst"}</span>
                      </div>
                      <button className="text-[10px] font-black text-primary-600 flex items-center gap-1 uppercase tracking-widest group-hover:gap-2 transition-all">
                        Execute <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredBlogs.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Strategic Intelligence Gap</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                We couldn't synchronize any architectural records matching your current filter parameters or search query.
              </p>
              <button 
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                className="mt-8 text-primary-600 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors border-b-2 border-primary-100 hover:border-slate-900 pb-1"
              >
                Reset Matrix Filters
              </button>
            </motion.div>
          )}

          {/* Newsletter / Neural Subscription Section */}
          <section className="mt-40 relative rounded-[4rem] overflow-hidden group shadow-2xl shadow-slate-900/10">
            <div className="absolute inset-0 bg-slate-900">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#38bdf8 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>
              <div className="absolute top-0 right-0 w-[60%] h-full bg-primary-600/10 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            </div>
            <div className="relative px-8 py-24 md:p-24 text-center max-w-4xl mx-auto z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight leading-[1.1]">Stay ahead of the <span className="text-primary-400">AI Shift</span></h2>
              <p className="text-slate-400 text-lg font-medium mb-12 leading-relaxed">
                Join 5,000+ enterprise architects receiving our bi-weekly neural synthesis on AI strategy and automation.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto bg-white/5 p-2 rounded-[2.5rem] backdrop-blur-md border border-white/10">
                <input 
                  type="email" 
                  placeholder="Official Work Intelligence Address" 
                  className="flex-grow px-8 py-5 rounded-[2rem] bg-transparent text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all font-medium"
                  required
                />
                <button className="bg-primary-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-primary-600/20 active:scale-95">
                  Synchronize
                </button>
              </form>
              <p className="mt-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                Secure Protocol. Instant Opt-Out Authority.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
