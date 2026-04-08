'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Edit3, Loader2, Save, ArrowLeft, Terminal, User, Briefcase, BarChart, GraduationCap, ChevronDown, Share2, Info } from 'lucide-react';
import TipTapEditor from '@/components/TipTapEditor';
import NewsletterRenderer from '@/components/NewsletterRenderer';
import ShareModal from '@/components/ShareModal';
import { apiClient } from '@/lib/api';

type GeneratorMode = 'manual' | 'keyword' | 'url';

export default function NewBlogPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<GeneratorMode>('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blogId, setBlogId] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [selectedTone, setSelectedTone] = useState<string>('human');
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);

  const TONES = [
    { id: 'human', label: 'Pragmatic Developer', icon: User, desc: 'Conversational & Humanized' },
    { id: 'professional', label: 'Balanced Corporate', icon: Briefcase, desc: 'Official & Technical' },
    { id: 'executive', label: 'C-Suite Insight', icon: BarChart, desc: 'Strategic & High-Level' },
    { id: 'academic', label: 'Neural Scholar', icon: GraduationCap, desc: 'Formal & Detailed' },
  ];

  const currentTone = TONES.find(t => t.id === selectedTone) || TONES[0];

  // ── AI Review State ──
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewReport, setReviewReport] = useState<any>(null);

  // ── Share Modal State ──
  const [showShareModal, setShowShareModal] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      status: 'draft',
      external_url: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      generation_method: 'manual',
      source_reference: ''
    }
  });

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
    if (!aiQuery.trim()) return;
    setIsGenerating(true);
    try {
      const response = await apiClient.generateBlog(mode as 'keyword' | 'url', aiQuery.trim(), selectedTone);
      const blog = response.blog;
      setBlogId(blog.id);
      setValue('title', blog.title || 'Untitled Publication');
      setValue('slug', blog.slug || generateSlug(blog.title || 'untitled'));
      setValue('generation_method', blog.generation_method || 'manual');
      setContent(blog.content || '');
      triggerReview(blog.content || '');
      setMode('manual');
      setAiQuery('');
    } catch (error: any) {
      console.error('AI Generation Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerReview = async (overrideContent?: string) => {
    const textToReview = overrideContent ?? content;
    if (!textToReview || textToReview.trim().length < 50) return;
    setIsReviewing(true);
    try {
      const result = await apiClient.reviewBlog(textToReview);
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
      if (blogId) {
        await apiClient.updateBlog(blogId, { ...data, content });
      } else {
        await apiClient.createBlog({ ...data, content });
      }
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save publication.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-[1800px] mx-auto font-outfit min-h-screen bg-slate-50/20">

      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white">
              <Edit3 size={16} />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Protocol Creation-v1.4</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Create Publication</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Intelligence Synthesis Matrix</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={16} className="inline mr-2" /> Discard Sequence
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="px-10 py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-900 shadow-xl shadow-primary-600/20 transition-all active:scale-95 flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Commit Publication
          </button>
        </div>
      </div>

      {/* AI Orchestration Terminal */}
      <div className="mb-12">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8 w-fit">
          {(['manual', 'keyword', 'url'] as GeneratorMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all relative ${mode === m ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {m === 'manual' ? <Edit3 size={14} /> : m === 'keyword' ? <Sparkles size={14} /> : <Terminal size={14} />}
                {m === 'manual' ? 'Manual Craft' : m === 'keyword' ? 'AI Keyword' : 'AI URL Redraft'}
              </span>
              {mode === m && (
                <motion.div layoutId="modeBg" className="absolute inset-0 bg-slate-900 rounded-xl shadow-xl shadow-slate-900/20" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode !== 'manual' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-slate-900 p-8 rounded-[3rem] relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-600/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-end">
                <div className="flex-grow space-y-6">
                  <div className="max-w-sm">
                    <label className="block text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
                      Neural Voicing Protocol
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold flex items-center justify-between hover:bg-white/10 transition-all outline-none"
                      >
                        <div className="flex items-center gap-4">
                          <currentTone.icon size={16} className="text-primary-400" />
                          <div className="text-left">
                            <p className="text-sm font-black tracking-tight">{currentTone.label}</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{currentTone.desc}</p>
                          </div>
                        </div>
                        <ChevronDown size={18} className={`text-slate-500 transition-transform ${isToneDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isToneDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-slate-950 border border-white/10 rounded-[2rem] shadow-2xl z-50 p-2 overflow-hidden">
                          {TONES.map(t => (
                            <button key={t.id} onClick={() => { setSelectedTone(t.id); setIsToneDropdownOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${selectedTone === t.id ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                              <t.icon size={18} />
                              <div className="text-left">
                                <p className="text-sm font-black tracking-tight">{t.label}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-60">{t.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder={mode === 'keyword' ? "Enter core intelligence topic..." : "Target URL: https://..."}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-white placeholder:text-slate-700 focus:ring-2 focus:ring-primary-600 outline-none transition-all font-bold"
                  />
                </div>
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !aiQuery.trim()}
                  className="px-12 py-5 bg-primary-600 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-white hover:text-slate-900 transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:scale-100 min-w-[240px]"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : 'Synthesize Release'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Dual-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* LEFT COLUMN: Manual Editor */}
        <div className="lg:col-span-7 space-y-8">
          <form className="space-y-8">
            {/* Publication Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm focus-within:shadow-xl transition-all">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Strategic Title</label>
                <input {...register('title')} onChange={handleTitleChange} className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-900 outline-none" placeholder="Enter Publication Title..." />
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm focus-within:shadow-xl transition-all">
                <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Registry Slug</label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-200">/</span>
                  <input {...register('slug')} className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Editor Environment */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" /> Narrative Environment
                </span>
                {isReviewing && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin text-primary-600" size={12} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Auditing Neural Record...</span>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden min-h-[700px]">
                <TipTapEditor content={content} onChange={setContent} />
              </div>
            </div>

            {/* Advanced Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-4">Visibility Matrix</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Protocol Status</label>
                    <select {...register('status')} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none cursor-pointer">
                      <option value="draft">System Draft</option>
                      <option value="published">Global Release</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Redirect Authority</label>
                    <input {...register('external_url')} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none" placeholder="https://..." />
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-slate-900/10 space-y-6 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary-600/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-4 relative z-10">Neural Optimization (SEO)</h3>
                <div className="space-y-6 relative z-10">
                  <input {...register('meta_title')} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-slate-700" placeholder="Meta Search Title..." />
                  <textarea {...register('meta_description')} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold h-32 resize-none placeholder:text-slate-700" placeholder="Strategic Narrative Summary..." />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Generated Preview & Audit */}
        <div className="lg:col-span-5 space-y-10 sticky top-8">

          {/* Neural Quality Report */}
          <AnimatePresence>
            {reviewReport && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-20"><BarChart size={64} /></div>
                <div className="flex items-center justify-between mb-10 relative z-10">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-none">Neural Quality Audit</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Synthesized Assessment Report</p>
                  </div>
                  <div className={`w-20 h-20 rounded-3xl flex flex-col items-center justify-center border-2 ${reviewReport.overall_score >= 80 ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                    <span className="text-2xl font-black">{reviewReport.overall_score}</span>
                    <span className="text-[8px] font-black opacity-60 uppercase tracking-widest">A-SCORE</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  {['structure_check', 'tone_check', 'hallucination_check', 'reference_check'].map(key => {
                    const res = reviewReport[key];
                    return (
                      <div key={key} className={`p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-lg ${res?.passed ? 'opacity-100' : 'border-red-200 bg-red-50/30'}`}>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2">{key.replace('_', ' ')}</p>
                        {res?.passed ? <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Protocol Pass</p> : <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Critical Optimization</p>}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                  <button onClick={() => setShowShareModal(true)} type="button" className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-primary-600 transition-all shadow-xl active:scale-95">
                    <Share2 size={14} /> Export Intelligence
                  </button>
                  <button type="button" onClick={() => triggerReview()} className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                    <Sparkles size={14} /> Re-Audit Records
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Synthesis Preview */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Synthesis Preview</span>
            </div>
            <div className="bg-white rounded-[4rem] p-10 md:p-14 border border-slate-100 shadow-2xl shadow-slate-200/40 min-h-[900px] relative">
              <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none text-slate-900"><Terminal size={80} /></div>
              <NewsletterRenderer content={content} hideLinks={true} stripReferences={true} />
              {!content && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
                    <Info size={40} />
                  </div>
                  <p className="text-slate-300 font-bold text-sm leading-relaxed uppercase tracking-widest">Standby for Narrative Feed...</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title={watch('title') || ''} content={content} />
    </div>
  );
}
