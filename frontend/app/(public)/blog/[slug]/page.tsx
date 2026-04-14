'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Clock,
  Calendar,
  ChevronRight,
  Menu,
  X,
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
      <div className="min-h-screen bg-[#fcfcfc] text-[#111] font-sans selection:bg-primary-600/20">
        {/* Reading Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-primary-600 z-[60] origin-left"
          style={{ scaleX }}
        />

        <main className="pt-24 md:pt-32 pb-40">
          <article className="max-w-4xl mx-auto px-6">
            {/* Header Section */}
            <header className="mb-16 md:mb-24 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-4 mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary-600">
                    {blog.category || 'General'}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-primary-600/30" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
                    {new Date(blog.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h1 className={`font-serif font-medium leading-[1.1] tracking-tight mb-12 ${blog.title && blog.title.length > 60 ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-5xl md:text-7xl lg:text-8xl'}`}>
                  {blog.title}
                </h1>

                <p className="text-xl md:text-2xl font-serif italic opacity-60 max-w-2xl mx-auto leading-relaxed">
                  {blog.excerpt || (blog.content ? blog.content.substring(0, 150) + '...' : '')}
                </p>
              </motion.div>
            </header>

            {/* Featured Image */}
            {blog.featured_image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="mb-24 relative group"
              >
                <div className="aspect-[16/9] overflow-hidden rounded-sm shadow-xl shadow-black/5">
                  <img
                    src={blog.featured_image}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 hidden md:block w-32 h-32 border-r border-b border-primary-600/20" />
                <div className="absolute -top-6 -left-6 hidden md:block w-32 h-32 border-l border-t border-primary-600/20" />
              </motion.div>
            )}

            {/* Content Section */}
            <div className="flex flex-col md:flex-row gap-16 relative">
              {/* Sidebar Meta */}
              <aside className="md:w-48 shrink-0">
                <div className="sticky top-32 space-y-12">
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 bg-slate-100">
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog.author || 'DATAVEX'}`} alt={blog.author || "Architect"} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest">{blog.author || 'System Architect'}</h4>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Author</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 pt-8 border-t border-black/5">
                    <button onClick={() => router.back()} className="flex items-center gap-3 opacity-40 hover:text-primary-600 hover:opacity-100 transition-colors cursor-pointer group text-left">
                      <ArrowLeft size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Return to Feed</span>
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-3 opacity-40 hover:text-primary-600 hover:opacity-100 transition-colors cursor-pointer group text-left">
                      <Share2 size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Share Article</span>
                    </button>
                  </div>
                </div>
              </aside>

              {/* Main Body Text */}
              <div className="flex-1 prose prose-lg prose-slate max-w-none">
                <div className="font-serif text-lg md:text-xl leading-relaxed opacity-80 space-y-8 first-letter:text-7xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:mt-2 first-letter:text-primary-600">
                   <NewsletterRenderer content={blog.content || ''} hideLinks={false} stripReferences={false} />
                </div>
                
                {/* Custom Styled Elements for the Content */}
                <style dangerouslySetInnerHTML={{ __html: `
                  .prose h1, .prose h2, .prose h3 { font-family: 'Cormorant Garamond', serif; font-size: 2.5rem; font-style: italic; margin-top: 4rem; margin-bottom: 1.5rem; color: #1a1a1a; }
                  .prose p { margin-bottom: 2rem; line-height: 1.8; }
                  .prose blockquote { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 1.75rem; border-left: 2px solid #5a5a40; padding-left: 2rem; margin: 4rem 0; color: #5a5a40; line-height: 1.4; }
                  .prose img { border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                `}} />
              </div>
            </div>
          </article>

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <section className="max-w-7xl mx-auto px-6 mt-40 pt-24 border-t border-black/5">
              <div className="flex items-center justify-between mb-16">
                <h2 className="text-4xl md:text-5xl font-serif italic">Further Reading</h2>
                <button onClick={() => router.push('/blog')} className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary-600">
                  View All Articles <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    onClick={() => router.push(`/blog/${rec.slug}`)}
                    className="group cursor-pointer"
                  >
                    <div className="mb-6 overflow-hidden aspect-[4/3] bg-slate-50 relative">
                      {rec.featured_image ? (
                        <img 
                          src={rec.featured_image} 
                          alt={rec.title} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100"><span className="font-serif italic text-slate-300">No Image</span></div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-primary-600">{rec.category || 'General'}</span>
                      <div className="w-1 h-1 rounded-full bg-primary-600/20" />
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">
                        {new Date(rec.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-2xl font-serif font-medium mb-4 group-hover:text-primary-600 transition-colors leading-tight">
                      {rec.title}
                    </h3>
                    <p className="text-sm opacity-50 leading-relaxed line-clamp-2 italic font-serif">
                      {rec.excerpt || (rec.content ? rec.content.substring(0, 100) : '')}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </PublicWrapper>
  );
}