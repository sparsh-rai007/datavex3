'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  ChevronRight,
  Calendar,
  Shield,
  Zap,
  Cpu,
  Binary
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
      className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group cursor-pointer"
    >
      {/* Left Text Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-[84px]">
        <div>
          <h4 className="text-[13px] font-sans font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h4>
          <p className="text-[11px] font-sans text-slate-500 line-clamp-2 mt-1 leading-tight">
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
          <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest font-sans">
            {hostname}
          </span>
        </div>
      </div>

      {/* Right Image Thumbnail */}
      <div className="w-[84px] h-[84px] shrink-0 rounded-lg bg-slate-50 overflow-hidden border border-primary-600/10 relative shadow-sm">
        <img
          src={meta.image}
          alt="Preview thumbnail"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 group-hover:grayscale-0"
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

  // State to track if the sidebar "Show all" button is clicked
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

  // Extract references efficiently using useMemo so it doesn't recalculate on scroll
  const referencesMatch = useMemo(() => {
    if (!blog?.content) return [];
    const matches = Array.from(blog.content.matchAll(/\[(.*?)\]\((https?:\/\/[^\)]+)\)/g));
    const uniqueMap = new Map(matches.map((m: any) => [m[2], { title: m[1], url: m[2] }]));
    return Array.from(uniqueMap.values());
  }, [blog?.content]);

  if (loading) {
    return (
      <PublicWrapper>
        <div className="min-h-screen bg-slate-50 pt-32 pb-40">
          <div className="max-w-[700px] mx-auto px-6 lg:px-0">
            <div className="animate-pulse space-y-6 mb-16">
              <div className="w-20 h-6 bg-slate-200/60 rounded-full"></div>
              <div className="w-full h-16 bg-slate-200/60 rounded-xl"></div>
              <div className="w-3/4 h-16 bg-slate-200/60 rounded-xl"></div>
            </div>
          </div>
        </div>
      </PublicWrapper>
    );
  }

  if (!blog) {
    return (
      <PublicWrapper>
        <div className="py-40 text-center relative overflow-hidden bg-slate-50 min-h-[60vh] flex flex-col justify-center items-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Record Not Found</h1>
          <button
            onClick={() => router.back()}
            className="mt-8 px-6 py-3 bg-slate-900 hover:bg-slate-850 active:bg-black text-white font-extrabold rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-slate-950/10"
          >
            Return to Feed
          </button>
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
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white min-h-screen font-sans selection:bg-primary-600/20">
        
        {/* Subtle grid background pattern matching the Home Page */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
        
        {/* Glowing blur effects matching the Home Page */}
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>

        {/* Reading Progress Bar */}
        <motion.div
           className="fixed top-0 left-0 right-0 h-1 bg-primary-600 z-[60] origin-left"
           style={{ scaleX }}
        />

        {/* Detail Header / Nav - Redesigned style */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors font-extrabold uppercase tracking-wider text-xs cursor-pointer"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Return to Feed
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-primary-600 transition-colors cursor-pointer"
                title="Share Article"
              >
                <Share2 size={18} />
              </button>
              <button
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-primary-600 transition-colors cursor-pointer"
                title="Bookmark Article"
              >
                <Bookmark size={18} />
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          
          {/* Release Label */}
          <div className="flex items-center gap-4 mb-6">
            <div className="text-[10px] font-bold text-primary-500 uppercase tracking-widest bg-primary-50 border border-primary-100/50 rounded-lg px-2.5 py-1 flex items-center gap-1.5 w-fit">
              <Calendar size={12} className="text-primary-500" />
              <span>{blog.category || "Intel Release"}</span>
            </div>
            <div className="h-px flex-1 bg-slate-200/60" />
          </div>

          {/* Neural Title - Redesigned style */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-12 max-w-5xl">
            {blog.title}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative">
            <div className="lg:col-span-8">

              {/* Narrative Context */}
              <div className="flex items-center gap-6 mb-12 py-5 border-y border-slate-200/80">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-none mb-1">Author</span>
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">{blog.author_name || "Editorial Synthesis"}</span>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Date</span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {mounted ? new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ""}
                  </span>
                </div>
              </div>

              {/* Featured Image */}
              {blog.featured_image && (
                <div className="mb-16 rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/5 border border-slate-200/80 group relative">
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-full h-auto max-h-[600px] object-cover transition-transform duration-1000 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Rendered Intelligence Matrix */}
              <NewsletterRenderer content={blog.content || ''} />
              
              <style dangerouslySetInnerHTML={{ __html: `
                .prose h2 { font-family: inherit; font-size: 1.875rem; font-weight: 800; margin-top: 3.5rem; margin-bottom: 1.25rem; color: #0f172a; tracking: -0.025em; }
                .prose p { margin-bottom: 1.5rem; line-height: 1.75; color: #334155; }
                .prose blockquote { font-family: inherit; font-weight: 500; font-size: 1.25rem; border-left: 4px solid #3b82f6; padding-left: 1.5rem; margin: 3rem 0; color: #1e3a8a; line-height: 1.5; }
              `}} />
            </div>

            {/* Dynamic Context Sidebar */}
            <div className="lg:col-span-4 hidden lg:block border-l border-slate-200/80 pl-10">
              <div className="sticky top-32 space-y-8">
                <div>
                  <h3 className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
                    Correlated Nodes
                  </h3>

                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-primary-500/5 border border-slate-200/80 overflow-hidden">
                    <div className="flex flex-col">
                      {(showAllRefs ? referencesMatch : referencesMatch.slice(0, 3)).map((ref: any, idx) => (
                        <PreviewNodeCard key={idx} url={ref.url} title={ref.title} />
                      ))}

                      {referencesMatch.length === 0 && (
                        <p className="text-xs font-medium text-slate-500 italic p-6 text-center">
                          No external references detected.
                        </p>
                      )}
                    </div>

                    {/* Show All Button */}
                    {referencesMatch.length > 3 && (
                      <div className="p-3 bg-slate-50/50 border-t border-slate-100">
                        <button
                          onClick={() => setShowAllRefs(!showAllRefs)}
                          className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-slate-200 transition-all cursor-pointer"
                        >
                          {showAllRefs ? "Collapse Archive" : `Analyze All Nodes (${referencesMatch.length})`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <RelatedReferences topic={blog.title} />
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Intelligence Matrix */}
          {recommendations.length > 0 && (
            <div className="mt-32 pt-20 border-t border-slate-200/80">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Further Synthesis</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => router.push(`/newsletter/${rec.slug}`)}
                    className="group cursor-pointer flex flex-col bg-white rounded-3xl border border-slate-200 hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300 p-6"
                  >
                    <div className="mb-6 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-50 relative border border-slate-100 shadow-sm">
                      <img 
                        src={`https://picsum.photos/seed/${rec.slug}/800/600`} 
                        alt={rec.title} 
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-103" 
                      />
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight line-clamp-2">
                      {rec.title}
                    </h3>

                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed font-normal">
                      {rec.excerpt}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {mounted ? new Date(rec.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ""}
                      </span>
                      <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Global Footer Context */}
          <div className="mt-32 pt-10 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} EDITORIAL SYNTHESIS — ALL RIGHTS RESERVED.</p>
            <div className="flex gap-8">
              {['Authority', 'Synthesis', 'Integrity'].map(word => (
                <span key={word} className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">{word}</span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </PublicWrapper>
  );
}
