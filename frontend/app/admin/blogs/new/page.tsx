'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Link as LinkIcon, Edit3, Loader2, Save, ArrowLeft, Terminal } from 'lucide-react';
import TipTapEditor from '@/components/TipTapEditor';
import BlogRenderer from '@/components/BlogRenderer';
import { apiClient } from '@/lib/api';

type GeneratorMode = 'manual' | 'keyword' | 'url';

export default function NewBlogPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<GeneratorMode>('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiQuery, setAiQuery] = useState('');

  // ── AI Review State ──
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewReport, setReviewReport] = useState<any>(null);

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      status: 'draft',
      external_url: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    }
  });

  const currentStatus = watch('status');

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleTitleChange = (e: any) => {
    const title = e.target.value;
    setValue("title", title);

    const currentSlug = watch("slug");
    if (!currentSlug || currentSlug.trim() === "") {
      setValue("slug", generateSlug(title));
    }
  };

  const handleGenerateAI = async () => {
    if (!aiQuery.trim()) {
      alert(mode === 'keyword' ? 'Please enter a keyword/topic' : 'Please enter a URL');
      return;
    }

    setIsGenerating(true);

    try {
      const type = mode as 'keyword' | 'url';

      // CALL AI API (Backend returns Markdown)
      const response = await apiClient.generateBlog(type, aiQuery.trim());
      const blog = response.blog;

      // Populate form with generated content (Native Markdown)
      setValue('title', blog.title || '');
      setValue('slug', blog.slug || generateSlug(blog.title || ''));
      setValue('excerpt', '');
      setContent(blog.content || '');

      // Trigger automatic review immediately on the new draft
      triggerReview(blog.content || '');

      // Switch to manual mode so user can review/edit the draft
      setMode('manual');
      setAiQuery('');

    } catch (error: any) {
      console.error('AI Generation Error:', error);
      alert(error?.response?.data?.error || 'Intelligence Generation Error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerReview = async (text: string) => {
    setIsReviewing(true);
    setReviewReport(null);
    try {
      const result = await apiClient.reviewBlog(text);
      setReviewReport(result);
    } catch (err) {
      console.error("Review failed", err);
    } finally {
      setIsReviewing(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (data: any) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Content is saved as raw Markdown from TipTap editor
      await apiClient.createBlog({ ...data, content });
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save article.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto font-outfit min-h-screen bg-slate-50/20">
      {/* Authority Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Publication</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Intelligence Synthesis Matrix</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-white hover:border-primary-100 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      {/* Operation Modes Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl mb-12 w-fit">
        {(['manual', 'keyword', 'url'] as GeneratorMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all relative ${mode === m ? 'text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {m === 'manual' ? <Edit3 size={14} /> : m === 'keyword' ? <Sparkles size={14} /> : <Terminal size={14} />}
              {m === 'manual' ? 'Manual Craft' : m === 'keyword' ? 'AI Keyword' : 'AI URL Redraft'}
            </span>
            {mode === m && (
              <motion.div
                layoutId="activeTabBgGenMarkdown"
                className="absolute inset-0 bg-slate-900 rounded-xl shadow-xl shadow-slate-900/20"
              />
            )}
          </button>
        ))}
      </div>

      {/* AI Intelligence Terminal */}
      <AnimatePresence mode="wait">
        {mode !== 'manual' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-900 p-10 rounded-[3rem] mb-16 relative overflow-hidden group shadow-2xl shadow-primary-900/20"
          >
            <div className="absolute top-0 right-0 w-[50%] h-full bg-primary-600/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

            {isGenerating && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
                <div className="flex gap-2.5 mb-6">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-3.5 h-3.5 bg-primary-500 rounded-full"
                    />
                  ))}
                </div>
                <p className="text-white font-black uppercase tracking-[0.4em] text-[11px]">Processing Neural Architecture</p>
              </div>
            )}

            <div className="flex items-start gap-4 mb-10 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-600/30">
                {mode === 'keyword' ? <Sparkles size={22} /> : <Terminal size={22} />}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight mb-2">Neural Generation Pipeline</h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-lg">
                  {mode === 'keyword'
                    ? 'Enter deep topic references to initiate cross-platform semantic synthesis. Our architecture handles formatting.'
                    : 'Analyze and redraft source authority intelligence using URL references for unique narrative retrieval.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 relative z-10">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder={mode === 'keyword' ? "Topic: Future of Neural Architecture..." : "Authority Source: https://..."}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-primary-600 outline-none transition-all font-medium"
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="bg-primary-600 text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-slate-900 transition-all shadow-[0_20px_40px_-5px_rgba(37,99,235,0.4)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 min-w-[240px]"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : 'Execute Sequence'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Core Narrative Environment */}
      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-12 ${isGenerating ? 'opacity-30 pointer-events-none' : 'transition-opacity duration-1000'}`}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all focus-within:shadow-xl focus-within:border-primary-100">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Strategic Label</label>
              <input
                {...register('title')}
                onChange={handleTitleChange}
                className="w-full bg-transparent border-none p-0 text-2xl font-black text-slate-900 placeholder:text-slate-200 outline-none"
                placeholder="Enter Publication Title..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all focus-within:shadow-xl focus-within:border-primary-100">
              <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Navigation Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-200 font-bold">/</span>
                <input
                  {...register('slug')}
                  className="flex-1 bg-transparent border-none p-0 text-lg font-bold text-slate-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" /> Narrative Intelligence
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marked Rendering Active</span>
          </div>

          {/* Loading Review Indicator */}
          <AnimatePresence>
            {isReviewing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                <div className="bg-primary-50 border border-primary-100 p-4 rounded-2xl flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-primary-600" size={20} />
                  <span className="text-primary-900 font-bold text-sm tracking-wide">🤖 AI is auditing this draft...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Review Report Panel */}
          <AnimatePresence>
            {reviewReport && !isReviewing && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-white border border-slate-200 shadow-xl rounded-[2rem] p-8 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary-600"></div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-900">AI Quality Audit</h3>
                  <div className={`px-4 py-2 rounded-xl font-black text-sm ${reviewReport.overall_score >= 80 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Score: {reviewReport.overall_score}/100
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Structure Check', key: 'structure_check' },
                    { name: 'Tone Check', key: 'tone_check' },
                    { name: 'Hallucination Check', key: 'hallucination_check' },
                    { name: 'Reference Check', key: 'reference_check' },
                  ].map((check) => {
                    const result = reviewReport[check.key];
                    return (
                      <div key={check.key} className={`p-4 rounded-2xl border ${result?.passed ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                        <div className="flex items-center gap-3 mb-1">
                          {result?.passed ? <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</div> : <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">!</div>}
                          <span className={`font-bold ${result?.passed ? 'text-green-900' : 'text-red-900'}`}>{check.name}</span>
                        </div>
                        {!result?.passed && result?.issues?.length > 0 && (
                          <ul className="mt-3 space-y-2 pl-9">
                            {result.issues.map((issue: string, i: number) => (
                              <li key={i} className="text-sm text-red-700 font-medium flex items-start gap-2">
                                <span className="text-red-400 mt-0.5">•</span> <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-[3rem] overflow-hidden border border-slate-100 bg-white shadow-2xl shadow-slate-200/20">
            <TipTapEditor content={content} onChange={setContent} />
          </div>
        </div>

        <div className="space-y-8 mt-12">
          <div className="flex items-center justify-between px-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" /> Live Preview
            </span>
          </div>
          <div className="rounded-[3rem] p-8 md:p-12 border border-slate-100 bg-white shadow-2xl shadow-slate-200/20 min-h-[400px]">
            <BlogRenderer content={content} />
          </div>
        </div>

        {/* Global Architecture Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-16 border-t border-slate-200">
          <div className="lg:col-span-1 space-y-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">System Controls</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mt-2">
                Define the visibility and metadata parameters for this architectural release.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Visibility Matrix</label>
                <select {...register('status')} className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary-600 outline-none appearance-none shadow-sm cursor-pointer">
                  <option value="draft">System Draft</option>
                  <option value="published">Global Release</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Redirect Authority</label>
                <input
                  {...register("external_url")}
                  className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary-600 outline-none shadow-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-slate-900/10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-primary-400"><Save size={18} /></div>
              <h3 className="text-xl font-black tracking-tight tracking-tight">SEO Neural Optimization</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4 ml-2">Meta Title Trace</label>
                <input
                  {...register("meta_title")}
                  className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-6 py-4 text-white font-medium focus:ring-2 focus:ring-primary-600 outline-none transition-all shadow-inner"
                  maxLength={60}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4 ml-2">Strategic Keywords</label>
                <input
                  {...register("meta_keywords")}
                  className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-6 py-4 text-white font-medium focus:ring-2 focus:ring-primary-600 outline-none transition-all shadow-inner"
                  placeholder="AI, Future, SaaS"
                />
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4 ml-2">Neural Meta Narrative</label>
              <textarea
                {...register("meta_description")}
                className="w-full bg-white/5 border border-white/10 rounded-[1.2rem] px-6 py-4 text-white font-medium focus:ring-2 focus:ring-primary-600 outline-none min-h-[120px] resize-none transition-all shadow-inner leading-relaxed"
                maxLength={160}
              />
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-slate-200 flex justify-end pb-32">
          <button
            type="submit"
            disabled={isSaving || isReviewing || (currentStatus === 'published' && (!reviewReport || reviewReport.overall_score < 80 || Object.values(reviewReport).some((val: any) => typeof val === 'object' && val?.passed === false)))}
            className="px-14 py-6 bg-primary-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-900 hover:scale-105 transition-all shadow-[0_20px_40px_-5px_rgba(37,99,235,0.4)] active:scale-95 group flex items-center gap-3 disabled:opacity-50 disabled:scale-100"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">Protocol Saving <Loader2 size={16} className="animate-spin" /></span>
            ) : (
              <span className="flex items-center gap-2">Commit Release <Save size={16} className="group-hover:rotate-45 transition-transform" /></span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
