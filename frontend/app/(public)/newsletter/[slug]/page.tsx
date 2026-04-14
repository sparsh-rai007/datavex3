'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import PublicWrapper from '../../wrapper';
import NewsletterRenderer from '@/components/NewsletterRenderer';
import RelatedReferences from '@/components/RelatedReferences';

// ---------------------------------------------------------------------------
// Preview Node Card Component (Fetches real website metadata)
// ---------------------------------------------------------------------------
const PreviewNodeCard = ({ url, title }: { url: string; title: string; key?: React.Key }) => {
  const [meta, setMeta] = useState({
    image: `https://image.thum.io/get/width/256/crop/256/${url}`, // Fallback screenshot
    description: 'Loading preview data...',
  });

  let hostname = 'external-source.com';
  try {
    hostname = new URL(url).hostname.replace('www.', '');
  } catch (e) { }

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
      className="flex items-start gap-4 p-4 hover:bg-[#fcfcfc] transition-colors border-b border-slate-100 last:border-0 group cursor-pointer"
    >
      {/* Left Text Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-[84px]">
        <div>
          <h4 className="text-[14px] font-serif font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h4>
          <p className="text-[12px] text-slate-500 line-clamp-2 mt-1 leading-tight italic">
            {meta.description}
          </p>
        </div>

        {/* Bottom Source Row */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <div className="w-4 h-4 rounded-full bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden p-0.5 border border-primary-600/10">
            <img
              src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
              className="w-full h-full object-cover rounded-full"
              alt=""
            />
          </div>
          <span className="text-[11px] font-bold text-slate-400 truncate uppercase tracking-widest">
            {hostname}
          </span>
        </div>
      </div>

      {/* Right Image Thumbnail */}
      <div className="w-[84px] h-[84px] shrink-0 rounded-lg bg-slate-50 overflow-hidden border border-primary-600/10 relative shadow-sm">
        <img
          src={meta.image}
          alt="Preview thumbnail"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0"
        />
      </div>
    </a>
  );
};

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
export default function NewsletterDetailPage() {
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
        const data = await apiClient.getPublicNewsletter(slug);
        if (data) {
          setBlog(data);

          // Fetch recommendations (other newsletters)
          try {
            const allNewsletters = await apiClient.getPublicNewsletters();
            const filtered = (allNewsletters || [])
              .filter((n: any) => String(n.id) !== String(slug))
              .map((n: any) => {
                const plain = String(n?.content || "")
                  .replace(/[#>*`_\-\[\]\(\)]/g, " ")
                  .replace(/\s+/g, " ")
                  .trim();
                return {
                  id: String(n.id),
                  slug: String(n.id),
                  title: n.title || "Untitled Newsletter",
                  excerpt: plain.slice(0, 180) || "Daily technical newsletter briefing.",
                  created_at: n.created_at,
                };
              })
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
  }, [slug]);

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
        <div className="min-h-screen bg-[#fcfcfc] pt-32 pb-40">
          <div className="max-w-[700px] mx-auto px-6 lg:px-0">
            <div className="animate-pulse space-y-6 mb-16">
              <div className="w-20 h-6 bg-slate-100 rounded-full"></div>
              <div className="w-full h-16 bg-slate-100 rounded-xl"></div>
              <div className="w-3/4 h-16 bg-slate-100 rounded-xl"></div>
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
          <h1 className="text-4xl font-serif italic text-slate-900">Record Not Found</h1>
          <button onClick={() => router.back()} className="mt-8 text-primary-600 font-bold uppercase tracking-widest text-[10px] border-b border-primary-600/20 pb-1 hover:border-primary-600 transition-all">Return to Feed</button>
        </div>
      </PublicWrapper>
    );
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt || 'Read this article on DATAVEX',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <PublicWrapper>
      <div className="min-h-screen bg-[#fcfcfc] font-sans">
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
              className="group flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors font-bold uppercase tracking-widest text-[10px]"
            >
              <ArrowLeft size={14} />
              Return to Feed
            </button>

            <div className="flex items-center gap-4">
              <button onClick={handleShare} className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
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
            
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          {/* Neural Title */}
          <h1 className="text-5xl md:text-7xl font-serif font-medium text-slate-900 leading-[1.1] tracking-tight mb-16 max-w-5xl">
            {blog.title}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
            <div className="lg:col-span-8">

              {/* Narrative Context */}
              <div className="flex items-center gap-6 mb-16 py-8 border-y border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-none mb-1">Author</span>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{blog.author_name || "Editorial Synthesis"}</span>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Date</span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                    {mounted ? new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ""}
                  </span>
                </div>
              </div>

              {/* Featured Matrix Image */}
              {blog.featured_image && (
                <div className="mb-20 rounded-sm overflow-hidden shadow-2xl shadow-slate-900/5 group relative">
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-full h-auto max-h-[600px] object-cover transition-transform duration-1000 group-hover:scale-105 grayscale hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 border border-primary-600/10 pointer-events-none" />
                </div>
              )}

              {/* Rendered Intelligence Matrix */}
              <NewsletterRenderer content={blog.content || ''} />
              
              <style dangerouslySetInnerHTML={{ __html: `
                .prose h2 { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; font-style: italic; margin-top: 4rem; margin-bottom: 1.5rem; color: #1a1a1a; }
                .prose p { margin-bottom: 2rem; line-height: 1.8; }
                .prose blockquote { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 1.75rem; border-left: 2px solid #5a5a40; padding-left: 2rem; margin: 4rem 0; color: #5a5a40; line-height: 1.4; }
              `}} />
            </div>

            {/* Dynamic Context Sidebar */}
            <div className="lg:col-span-4 hidden lg:block border-l border-slate-100 pl-10">
              <div className="sticky top-32">
                <h3 className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                  Correlated Nodes
                </h3>

                {/* --- UPDATED LIGHT THEME UI --- */}
                <div className="bg-[#fcfcfc] rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                  <div className="flex flex-col">
                    {/* NEW: Slice based on showAllRefs state */}
                    {(showAllRefs ? referencesMatch : referencesMatch.slice(0, 3)).map((ref: any, idx) => (
                      <PreviewNodeCard key={idx} url={ref.url} title={ref.title} />
                    ))}

                    {referencesMatch.length === 0 && (
                      <p className="text-xs font-medium text-slate-500 italic p-6 text-center">
                        No external references detected.
                      </p>
                    )}
                  </div>

                  {/* Show All Button - Now Functional */}
                  {referencesMatch.length > 3 && (
                    <div className="p-3 bg-slate-50/50">
                      <button
                        onClick={() => setShowAllRefs(!showAllRefs)}
                        className="w-full py-2.5 bg-[#fcfcfc] hover:bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-widest rounded-lg border border-primary-600/10 transition-all"
                      >
                        {showAllRefs ? "Collapse Archive" : `Analyze All Nodes (${referencesMatch.length})`}
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
                  <h2 className="text-4xl font-serif italic text-slate-900 tracking-tight">Further Synthesis</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => router.push(`/newsletter/${rec.slug}`)}
                    className="group cursor-pointer flex flex-col"
                  >
                    <div className="mb-6 aspect-[4/3] overflow-hidden rounded-sm bg-slate-50 relative">
                      <img 
                        src={`https://picsum.photos/seed/${rec.slug}/800/600`} 
                        alt={rec.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 border border-primary-600/10 pointer-events-none" />
                    </div>
                    
                    <h3 className="text-2xl font-serif font-medium text-slate-900 mb-4 group-hover:text-primary-600 transition-colors leading-tight">
                      {rec.title}
                    </h3>

                    <p className="text-slate-500 font-serif italic text-sm mb-8 line-clamp-2 leading-relaxed">
                      {rec.excerpt}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {mounted ? new Date(rec.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ""}
                      </span>
                      <div className="w-8 h-8 rounded-full border border-primary-600/20 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Global Footer Context */}
          <div className="mt-40 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© {new Date().getFullYear()} EDITORIAL SYNTHESIS — ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
              {['Authority', 'Synthesis', 'Integrity'].map(word => (
                <span key={word} className="text-[9px] font-bold text-slate-200 uppercase tracking-[0.4em]">{word}</span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </PublicWrapper>
  );
}
