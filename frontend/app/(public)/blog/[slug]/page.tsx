'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Bookmark,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import PublicWrapper from '../../wrapper';
import NewsletterRenderer from '@/components/NewsletterRenderer';
import RelatedReferences from '@/components/RelatedReferences';

// ---------------------------------------------------------------------------
// Preview Node Card Component (Fetches real website metadata)
// ---------------------------------------------------------------------------
const PreviewNodeCard = ({ url, title }: { url: string; title: string }) => {
  const [meta, setMeta] = useState({
    image: `https://image.thum.io/get/width/256/crop/256/${url}`, // Fallback screenshot
    description: 'Loading preview data...',
  });

  let hostname = 'external-source.com';
  try {
    hostname = new URL(url).hostname.replace('www.', '');
  } catch (e) {}

  useEffect(() => {
    // Fetch real website metadata via free Microlink API
    fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setMeta({
            image: data.data?.image?.url || data.data?.logo?.url || meta.image,
            description: data.data?.description || 'Reference documentation and guides.',
          });
        }
      })
      .catch(() => {
        setMeta((prev) => ({ ...prev, description: 'External reference link.' }));
      });
  }, [url]);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group cursor-pointer"
    >
      {/* Left Text Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-[84px]">
        <div>
          <h4 className="text-[14px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h4>
          <p className="text-[12px] text-slate-500 line-clamp-2 mt-1 leading-tight">
            {meta.description}
          </p>
        </div>

        {/* Bottom Source Row */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden p-0.5 border border-slate-200">
            <img
              src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
              className="w-full h-full object-cover rounded-full"
              alt=""
            />
          </div>
          <span className="text-[11px] font-bold text-slate-400 truncate uppercase tracking-widest">
            {hostname}
          </span>
          <div className="ml-auto text-slate-300 opacity-50 group-hover:opacity-100 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right Image Thumbnail */}
      <div className="w-[84px] h-[84px] shrink-0 rounded-[14px] bg-slate-50 overflow-hidden border border-slate-100 relative shadow-sm">
        <img
          src={meta.image}
          alt="Preview thumbnail"
          className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-500"
        />
      </div>
    </a>
  );
};

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // State for recommended blogs
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  // NEW: State to track if the sidebar "Show all" button is clicked
  const [showAllRefs, setShowAllRefs] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    setMounted(true);
    async function loadBlog() {
      try {
        const data = await apiClient.getPublicBlog(slug);
        if (data) {
          if (data.external_url) {
            window.open(data.external_url, '_blank');
            router.back();
            return;
          }
          setBlog(data);
          
          // Fetch recommendations (other blogs)
          try {
            const allBlogs = await apiClient.getPublicBlogs();
            // Filter current blog and take 3
            const filtered = (allBlogs || [])
              .filter((b: any) => b.slug !== slug)
              .slice(0, 3);
            setRecommendations(filtered);
          } catch (recErr) {
            console.error("Failed to load recommendations", recErr);
          }
        }
      } catch (err) {
        console.error("Failed to load blog", err);
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
    window.scrollTo(0, 0);
  }, [slug, router]);

  // NEW: Extract references efficiently using useMemo so it doesn't recalculate on scroll
  const referencesMatch = useMemo(() => {
    if (!blog?.content) return [];
    const matches = Array.from(blog.content.matchAll(/\[(.*?)\]\((https?:\/\/[^\)]+)\)/g));
    const uniqueMap = new Map(matches.map((m: any) => [m[2], { title: m[1], url: m[2] }]));
    return Array.from(uniqueMap.values());
  }, [blog?.content]);

  if (loading) {
    return (
      <PublicWrapper>
        <div className="min-h-screen bg-slate-50 font-outfit pt-32 pb-40">
          <div className="max-w-[700px] mx-auto px-6 lg:px-0">
            {/* Header Skeleton */}
            <div className="animate-pulse space-y-6 mb-16">
              <div className="flex items-center gap-3">
                <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
                <div className="w-4 h-4 rounded-full bg-slate-200"></div>
                <div className="w-24 h-4 bg-slate-200 rounded-full"></div>
              </div>
              <div className="w-full h-16 bg-slate-200 rounded-3xl"></div>
              <div className="w-3/4 h-16 bg-slate-200 rounded-3xl"></div>
              <div className="flex items-center gap-4 mt-8">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-slate-200 rounded-full"></div>
                  <div className="w-32 h-3 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="animate-pulse space-y-8">
              <div className="w-full h-8 bg-slate-200 rounded-full"></div>
              <div className="w-full h-4 bg-slate-200 rounded-full"></div>
              <div className="w-5/6 h-4 bg-slate-200 rounded-full"></div>
              <div className="w-full h-4 bg-slate-200 rounded-full"></div>
              <div className="w-4/5 h-4 bg-slate-200 rounded-full"></div>

              <div className="w-full h-64 bg-slate-200 rounded-[3rem] mt-10 mb-10"></div>

              <div className="w-5/6 h-4 bg-slate-200 rounded-full"></div>
              <div className="w-full h-4 bg-slate-200 rounded-full"></div>
              <div className="w-4/5 h-4 bg-slate-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </PublicWrapper>
    );
  }

  if (!blog) {
    return (
      <PublicWrapper>
        <div className="py-40 text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Record Not Found</h1>
          <p className="text-slate-400 font-medium mt-2">The requested architectural synthesis does not exist in our core.</p>
          <button onClick={() => router.back()} className="mt-8 text-primary-600 font-black uppercase tracking-widest text-[10px] border-b-2 border-primary-100 pb-1 hover:border-primary-600 transition-all">Return to Feed</button>
        </div>
      </PublicWrapper>
    );
  }

  return (
    <PublicWrapper>
      <div className="min-h-screen bg-white font-outfit">
        {/* Reading Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-primary-600 z-[60] origin-left"
          style={{ scaleX }}
        />

        {/* Detail Header / Nav */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors font-black uppercase tracking-widest text-[10px]"
            >
              <ArrowLeft size={14} />
              Return to Feed
            </button>

            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                <Share2 size={18} />
              </button>
              <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                <Bookmark size={18} />
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-24">
          {/* Release Label */}
          <div className="flex items-center gap-4 mb-8">
            <span className="px-4 py-1.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary-600/20">
              {blog.category || "Intelligence Release"}
            </span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Neural Title */}
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-16 max-w-5xl">
            {blog.title}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
            <div className="lg:col-span-8">

              {/* Narrative Context */}
              <div className="flex items-center gap-6 mb-16 py-8 border-y border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Author Trace</span>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{blog.author_name || "DataVex Architect"}</span>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Retrieval Date</span>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                    {mounted ? new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ""}
                  </span>
                </div>
              </div>

              {/* Featured Matrix Image */}
              {blog.featured_image && (
                <div className="mb-20 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 group">
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-full h-auto max-h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Rendered Intelligence Matrix */}
              <NewsletterRenderer content={blog.content || ''} />
            </div>

            {/* Dynamic Context Sidebar */}
            <div className="lg:col-span-4 hidden lg:block border-l border-slate-100 pl-10">
              <div className="sticky top-32">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
                  Correlated External Nodes
                </h3>

                {/* --- UPDATED LIGHT THEME UI --- */}
                <div className="bg-white rounded-[24px] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="flex flex-col">
                    {/* NEW: Slice based on showAllRefs state */}
                    {(showAllRefs ? referencesMatch : referencesMatch.slice(0, 3)).map((ref: any, idx) => (
                      <PreviewNodeCard key={idx} url={ref.url} title={ref.title} />
                    ))}

                    {referencesMatch.length === 0 && (
                      <p className="text-xs font-medium text-slate-400 italic p-6 text-center">
                        No external references detected.
                      </p>
                    )}
                  </div>

                  {/* Show All Button - Now Functional */}
                  {referencesMatch.length > 3 && (
                    <div className="p-3 bg-slate-50/50">
                      <button 
                        onClick={() => setShowAllRefs(!showAllRefs)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        {showAllRefs ? "Collapse Matrix" : `Analyze All Nodes (${referencesMatch.length})`}
                      </button>
                    </div>
                  )}
                </div>
                {/* --- END EXACT UI MATCH --- */}

                <div className="mt-8">
                  <RelatedReferences topic={blog.title} />
                </div>

               
              </div>
            </div>
          </div>
          
          {/* Recommended Intelligence Matrix */}
          {recommendations.length > 0 && (
            <div className="mt-32 pt-24 border-t border-slate-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">More Blogs</h2>
                 </div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse hidden md:block" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => router.push(`/blog/${rec.slug}`)}
                    className="group cursor-pointer bg-slate-50/50 rounded-[2.5rem] border border-slate-50 p-8 hover:bg-white hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-600/5 transition-all duration-500 flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      
                      <div className="h-px flex-1 bg-slate-100/50" />
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight tracking-tight">
                      {rec.title}
                    </h3>
                    
                    <p className="text-slate-400 font-medium text-sm mb-8 line-clamp-3 leading-relaxed">
                      {rec.excerpt}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100/50">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{rec.read_time || "5 Min Read"}</span>
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary-600 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Global Footer Context */}
          <div className="mt-40 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">© {new Date().getFullYear()} DATAVEX.ai — ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
              {['Authority', 'Synthesis', 'Integrity'].map(word => (
                <span key={word} className="text-[9px] font-black text-slate-200 uppercase tracking-[0.4em]">{word}</span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </PublicWrapper>
  );
}