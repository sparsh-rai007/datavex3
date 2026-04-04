'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Search, 
  ChevronRight,
  TrendingUp,
  Clock,
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

interface NewsletterListClientProps {
  blogs: BlogPost[];
}

const CATEGORIES = ['All Records', 'AI Strategy', 'Neural Systems', 'Security Protocol', 'Enterprise Synthesis', 'Tactical Analysis'];

export default function NewsletterListClient({ blogs }: NewsletterListClientProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All Records');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBlogs = blogs.filter(post => {
    const searchCat = activeCategory === 'All Records' ? 'All' : activeCategory;
    const matchesCategory = activeCategory === 'All Records' || post.category === searchCat || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogs[0];

  const handleReadMore = (post: BlogPost) => {
    if (post.external_url) {
      window.open(post.external_url, '_blank');
    } else {
      router.push(`/newsletter/${post.slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-outfit">
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
                <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-600/20">
                  <Binary size={20} />
                </div>
                <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Neural Synthesis Archive</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[0.95]">
                Today's <span className="text-primary-600">Synthetic</span> Briefing Core
              </h1>
              <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed max-w-2xl">
                Deep architectural analysis and tactical intelligence for the next generation of AI-driven enterprises.
              </p>
            </motion.div>
          </div>

          {/* Featured Edition */}
          {activeCategory === 'All Records' && !searchQuery && featuredPost && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-24"
            >
              <div 
                onClick={() => handleReadMore(featuredPost)}
                className={`group cursor-pointer relative grid gap-12 bg-white rounded-[4rem] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40 p-4 md:p-8 ${
                  featuredPost.featured_image ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
                }`}
              >
                {featuredPost.featured_image && (
                  <div className="lg:col-span-6 relative h-[400px] lg:h-[600px] rounded-[3rem] overflow-hidden shadow-inner">
                    <img 
                      src={featuredPost.featured_image} 
                      alt={featuredPost.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-slate-900/80 to-transparent">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                           <span className="text-[10px] font-black text-white uppercase tracking-widest">Central Archive Retrieval — 01</span>
                        </div>
                    </div>
                  </div>
                )}
                <div className={`flex flex-col justify-center py-10 px-6 ${featuredPost.featured_image ? 'lg:col-span-6' : 'max-w-4xl mx-auto text-center items-center'}`}>
                  <div className={`flex items-center gap-4 mb-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 ${!featuredPost.featured_image ? 'justify-center' : ''}`}>
                    <span className="text-primary-600 px-3 py-1 bg-primary-50 rounded-full">{featuredPost.category || "General Briefing"}</span>
                    <span>/</span>
                    <span className="flex items-center gap-2"><Shield size={14} /> High Authority</span>
                  </div>
                  <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-8 group-hover:text-primary-600 transition-colors leading-[1.05] tracking-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-slate-500 font-medium text-lg lg:text-xl mb-12 leading-relaxed line-clamp-4">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className={`flex items-center justify-between w-full pt-10 border-t border-slate-50 ${!featuredPost.featured_image ? 'max-w-2xl' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-xl">
                        {featuredPost.author_name?.charAt(0) || "D"}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{featuredPost.author_name || "Synthesis Engine"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(featuredPost.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-4 text-primary-600 font-black uppercase tracking-[0.2em] text-[10px] group-hover:translate-x-2 transition-transform">
                      Analyze Briefing <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Records Filter Architecture */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 mb-16">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 xl:pb-0 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border-2 ${
                    activeCategory === cat 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-900/30' 
                      : 'bg-white text-slate-400 border-slate-100 hover:border-primary-600/20 hover:text-primary-600 hover:scale-105'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative group min-w-[400px]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Synchronize with Archive Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-sm font-bold focus:outline-none focus:border-primary-600 transition-all shadow-xl shadow-slate-200/20 placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
              />
            </div>
          </div>

          {/* Synthesis Archive Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence mode="popLayout">
              {filteredBlogs.map((post, index) => (
                <motion.article
                  layout
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                  onClick={() => handleReadMore(post)}
                  className="group cursor-pointer bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_40px_80px_-15px_rgba(30,41,59,0.1)] transition-all duration-700 flex flex-col"
                >
                  {post.featured_image && (
                    <div className="relative h-64 overflow-hidden m-4 rounded-[2.5rem]">
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-5 left-5">
                        <span className="bg-white/95 backdrop-blur px-4 py-2 rounded-2xl text-[9px] font-black text-slate-900 uppercase tracking-widest border border-slate-100">
                          Edition: {post.category || "Release"}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-10 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 mb-8 text-[11px] font-black text-slate-300 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><TrendingUp size={14} className="text-primary-600/50" /> {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-primary-600 transition-colors line-clamp-2 leading-[1.2] tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 font-medium text-base mb-10 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[11px] font-black text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                          {post.author_name?.charAt(0) || "S"}
                        </div>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Neural Analyst</span>
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-slate-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all shadow-sm">
                        <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty Records State */}
          {filteredBlogs.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Search size={40} className="text-slate-200" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Intelligence Archive Gap</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed mb-12">
                We couldn't synchronize any architectural records matching your current filter parameters or search query.
              </p>
              <button 
                onClick={() => { setActiveCategory('All Records'); setSearchQuery(''); }}
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-600 transition-all shadow-2xl active:scale-95"
              >
                Reset Feed Matrix
              </button>
            </motion.div>
          )}

          {/* Future Subscription Matrix */}
          <section className="mt-48 relative rounded-[5rem] overflow-hidden group shadow-[0_60px_120px_-20px_rgba(0,0,0,0.1)]">
            <div className="absolute inset-0 bg-slate-900">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#38bdf8 2px, transparent 2px)', backgroundSize: '60px 60px' }}></div>
              <div className="absolute -top-1/2 -right-1/4 w-[80%] h-full bg-primary-600/10 blur-[200px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            </div>
            <div className="relative px-10 py-32 md:p-32 text-center max-w-5xl mx-auto z-10">
                <div className="flex justify-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform"><Cpu size={24} /></div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform delay-75"><Zap size={24} /></div>
                </div>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tight leading-[0.95]">Authority Through <span className="text-primary-400">Synthesis</span>.</h2>
              <p className="text-slate-400 text-xl font-medium mb-16 leading-relaxed max-w-3xl mx-auto">
                Join 5,000+ enterprise architects receiving our bi-weekly neural synthesis on AI strategy and technical automation.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto bg-white/5 p-3 rounded-[3rem] backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
                <input 
                  type="email" 
                  placeholder="Official Work Intelligence Address" 
                  className="flex-grow px-10 py-6 rounded-[2.5rem] bg-transparent text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all font-black uppercase tracking-widest text-[10px]"
                  required
                />
                <button className="bg-primary-600 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-primary-600/30 active:scale-95">
                  Synchronize
                </button>
              </form>
              <div className="mt-12 flex items-center justify-center gap-8 py-6 border-t border-white/5 max-w-md mx-auto">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-green-500" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Archive Online</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary-500" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Secured</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
