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
  Shield,
  Zap,
  Cpu,
  Binary,
  Heart,
  Eye
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import PublicWrapper from '../../wrapper';
import NewsletterRenderer from '@/components/NewsletterRenderer';
import RelatedReferences from '@/components/RelatedReferences';
import { formatMarkdownBold } from '@/lib/markdown';

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
          <h4 className="text-[13px] font-sans font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h4>
          <p className="text-[11px] font-sans text-slate-500 line-clamp-2 mt-1 leading-tight">
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
          <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest font-sans">
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
      <div className="w-[84px] h-[84px] shrink-0 rounded-lg bg-slate-50 overflow-hidden border border-slate-100 relative shadow-sm">
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
export default function BlogDetailPage() {
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

  // Engagement state
  const [engagement, setEngagement] = useState({ views: 0, likes: 0, hasLiked: false });

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
          
          // Record view and fetch engagement
          await apiClient.recordBlogView(slug);
          const engagementData = await apiClient.getBlogEngagement(slug);
          setEngagement(engagementData);

          // Fetch recommendations (other blogs)
          try {
            const allBlogs = await apiClient.getPublicBlogs();
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

  const handleLike = async () => {
    // Optimistic update
    const previousState = { ...engagement };
    setEngagement(prev => ({
      ...prev,
      hasLiked: !prev.hasLiked,
      likes: prev.hasLiked ? prev.likes - 1 : prev.likes + 1
    }));

    try {
      const result = await apiClient.toggleBlogLike(slug);
      if (!result.success) {
        // Revert on failure
        setEngagement(previousState);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      setEngagement(previousState);
    }
  };

  // Extract references efficiently using useMemo so it doesn't recalculate on scroll
  const referencesMatch = useMemo(() => {
    if (!blog?.content) return [];
    const matches = Array.from(blog.content.matchAll(/\[(.*?)\]\((https?:\/\/[^\)]+)\)/g));
    const uniqueMap = new Map(matches.map((m: any) => [m[2], { title: m[1], url: m[2] }]));
    return Array.from(uniqueMap.values());
  }, [blog?.content]);

  // Extract banner image from content if featured_image is missing
  const bannerImage = useMemo(() => {
    if (blog?.featured_image) return blog.featured_image;
    if (blog?.content) {
      const mdMatch = blog.content.match(/!\[.*?\]\((.*?)\)/);
      if (mdMatch && mdMatch[1]) return mdMatch[1];
      const htmlMatch = blog.content.match(/<img[^>]+src=["'](.*?)["']/);
      if (htmlMatch && htmlMatch[1]) return htmlMatch[1];
    }
    return null;
  }, [blog]);

  if (loading) {
    return (
      <PublicWrapper>
        <div className="min-h-screen bg-slate-50 pt-32 pb-40">
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
            </div>

            {/* Content Skeleton */}
            <div className="animate-pulse space-y-8">
              <div className="w-full h-8 bg-slate-200 rounded-full"></div>
              <div className="w-full h-4 bg-slate-200 rounded-full"></div>
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
      <div className="relative overflow-x-clip bg-gradient-to-b from-blue-50/50 via-white to-white min-h-screen font-sans text-slate-850 selection:bg-primary-600/20">
        
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
          <article className="max-w-5xl mx-auto">
            {/* Header Section */}
            <header className="mb-16 text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500 bg-primary-50 border border-primary-100/50 rounded-lg px-2.5 py-1 flex items-center gap-1.5 w-fit">
                    <Calendar size={12} className="text-primary-500" />
                    <span>{blog.category || 'General'}</span>
                  </span>
                  <div className="w-1 h-1 rounded-full bg-primary-600/30" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {new Date(blog.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-primary-600/30" />
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <Eye size={14} className="text-slate-400" />
                    {engagement.views} {engagement.views === 1 ? 'View' : 'Views'}
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-8">
                  {blog.title}
                </h1>

                <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-4xl font-normal">
                  {formatMarkdownBold(blog.excerpt || (blog.content ? blog.content.replace(/!\[.*?\]\(.*?\)/g, '').substring(0, 150) + '...' : ''))}
                </p>
              </motion.div>
            </header>

            {/* Featured Image */}
            {bannerImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="mb-16 relative group"
              >
                <div className="aspect-[16/9] overflow-hidden rounded-3xl border border-slate-200/80 shadow-2xl shadow-primary-500/5">
                  <img
                    src={bannerImage}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>
            )}

            {/* Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative">
              {/* Sidebar Meta */}
              <aside className="lg:col-span-3 shrink-0">
                <div className="sticky top-32 space-y-8">
                  <div className="flex items-center gap-4 bg-white/80 border border-slate-200/80 p-4 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog.author || 'DATAVEX'}`} alt={blog.author || "Architect"} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">{blog.author || 'System Architect'}</h4>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mt-1">Author</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-6 border-t border-slate-200/80 text-left">
                    <button onClick={() => router.back()} className="flex items-center gap-3 text-slate-500 hover:text-primary-600 transition-colors cursor-pointer group text-left">
                      <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Return to Feed</span>
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-3 text-slate-500 hover:text-primary-600 transition-colors cursor-pointer group text-left">
                      <Share2 size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Share Article</span>
                    </button>
                    <button onClick={handleLike} className={`flex items-center gap-3 transition-colors cursor-pointer group text-left ${engagement.hasLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}>
                      <Heart size={16} className={engagement.hasLiked ? 'fill-current' : ''} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {engagement.likes} {engagement.likes === 1 ? 'Like' : 'Likes'}
                      </span>
                    </button>
                  </div>
                </div>
              </aside>

              {/* Main Body Text */}
              <div className="lg:col-span-9 prose prose-lg prose-slate max-w-none text-left">
                <div className="font-sans text-slate-700 leading-relaxed space-y-6">
                   <NewsletterRenderer content={blog.content || ''} hideLinks={false} stripReferences={false} />
                </div>
                
                {/* Custom Styled Elements for the Content */}
                <style dangerouslySetInnerHTML={{ __html: `
                  .prose h1, .prose h2, .prose h3 { font-family: inherit; font-size: 1.875rem; font-weight: 800; margin-top: 3.5rem; margin-bottom: 1.25rem; color: #0f172a; tracking: -0.025em; }
                  .prose p { margin-bottom: 1.5rem; line-height: 1.75; color: #334155; }
                  .prose blockquote { font-family: inherit; font-weight: 500; font-size: 1.25rem; border-left: 4px solid #3b82f6; padding-left: 1.5rem; margin: 3rem 0; color: #1e3a8a; line-height: 1.5; }
                  .prose img { border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                `}} />
              </div>
            </div>
          </article>

          {/* Recommendations Section */}
          {recommendations.length > 0 && (
            <section className="max-w-5xl mx-auto mt-32 pt-20 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Further Reading</h2>
                <button
                  onClick={() => router.push('/blog')}
                  className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700 transition-colors"
                >
                  View All Articles <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    onClick={() => router.push(`/blog/${rec.slug}`)}
                    className="group cursor-pointer flex flex-col bg-white rounded-3xl border border-slate-200 hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-300 p-6"
                  >
                    
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500 bg-primary-50 border border-primary-100/50 rounded-lg px-2.5 py-1 flex items-center gap-1.5 w-fit">
                        <span>{rec.category || 'General'}</span>
                      </span>
                      <div className="w-1 h-1 rounded-full bg-primary-600/20" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                        {new Date(rec.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors leading-tight line-clamp-2 text-left">
                      {rec.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 font-normal text-left">
                      {formatMarkdownBold(rec.excerpt || (rec.content ? rec.content.replace(/!\[.*?\]\(.*?\)/g, '').substring(0, 100) : ''))}
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