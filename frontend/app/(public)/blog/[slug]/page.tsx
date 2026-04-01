'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Calendar,
  Clock,
  Share2 as ShareIcon
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import PublicWrapper from '../../wrapper';
import BlogRenderer from '@/components/BlogRenderer';
import RelatedReferences from '@/components/RelatedReferences';

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
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
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
          <BlogRenderer content={blog.content || ''} />
        </div>

        {/* Dynamic Context Sidebar */}
        <div className="lg:col-span-4 hidden lg:block border-l border-slate-100 pl-10">
          <div className="sticky top-32">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
              Correlated External Nodes
            </h3>
            
            <div className="space-y-6">
              {Array.from(new Map(Array.from((blog.content || '').matchAll(/\[(.*?)\]\((https?:\/\/[^\)]+)\)/g)).map((m: any) => [m[2], { title: m[1], url: m[2] }])).values()).map((ref: any, idx) => {
                let hostname = 'external-source.com';
                try { hostname = new URL(ref.url).hostname.replace('www.', ''); } catch (e) {}

                return (
                  <a key={idx} href={ref.url} target="_blank" rel="noopener noreferrer" className="block group">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-1 shadow-sm group-hover:bg-primary-50 group-hover:border-primary-100 transition-all">
                        <img src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`} className="w-4 h-4" alt="" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">{ref.title}</h4>
                        <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-2 block group-hover:text-primary-400 transition-colors">{hostname}</span>
                      </div>
                    </div>
                  </a>
                );
              })}

              {Array.from((blog.content || '').matchAll(/\[(.*?)\]\((https?:\/\/[^\)]+)\)/g)).length === 0 && (
                <p className="text-xs font-medium text-slate-400 italic">No external references detected in this intelligence node.</p>
              )}
            </div>

            <RelatedReferences topic={blog.title} />

            <div className="mt-8 p-6 rounded-3xl bg-slate-50 border border-slate-100">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Node Integrity Status</h3>
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 <span className="text-xs font-bold text-slate-900">Verified Authentic</span>
               </div>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">This architectural document has been audited for hallucinations and structural integrity via neural pipelines.</p>
            </div>
          </div>
        </div>
      </div>

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
