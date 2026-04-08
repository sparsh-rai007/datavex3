'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import TipTapEditor from '@/components/TipTapEditor';
import NewsletterRenderer from '@/components/NewsletterRenderer';
import ShareModal from '@/components/ShareModal';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Sparkles, Loader2, Share2, BarChart, Terminal, Info, Edit3, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id as string;

  const [content, setContent] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewReport, setReviewReport] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const { register, setValue, handleSubmit, watch } = useForm();

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (e: any) => {
    const title = e.target.value;
    setValue('title', title);
    if (!watch('slug')?.trim()) setValue('slug', generateSlug(title));
  };

  useEffect(() => {
    apiClient.getBlog(blogId).then((data) => {
      setValue('title', data.title);
      setValue('slug', data.slug);
      setValue('excerpt', data.excerpt);
      setValue('status', data.status);
      setValue('meta_title', data.meta_title || '');
      setValue('meta_description', data.meta_description || '');
      setValue('meta_keywords', data.meta_keywords || '');
      setValue('external_url', data.external_url || '');
      setContent(data.content);
      setLoading(false);
      // Trigger initial audit
      if (data.content) triggerReview(data.content);
    }).catch(err => {
      console.error("Load failed", err);
      setLoading(false);
    });
  }, [blogId, setValue]);

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
      await apiClient.updateBlog(blogId, { ...data, content });
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update blog record.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Blog Matrix...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1800px] mx-auto font-outfit min-h-screen bg-slate-50/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                 <Edit3 size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Article Optimization Portal</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">Edit Publication</h1>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Intelligence Matrix Record</p>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => router.push('/admin/blogs')} className="px-6 py-3 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-all shadow-sm">
              <ArrowLeft size={16} className="inline mr-2" /> Back to Matrix
           </button>
           <button 
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="px-10 py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-900 shadow-xl shadow-primary-600/20 transition-all active:scale-95 flex items-center gap-2"
           >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Update Publication Record
           </button>
        </div>
      </div>

      {/* Side-by-Side Optimization Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT COLUMN: Manual Editor */}
        <div className="lg:col-span-7 space-y-8">
           <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm focus-within:shadow-xl transition-all">
                   <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Strategic Label</label>
                   <input {...register('title')} onChange={handleTitleChange} className="w-full bg-transparent border-none p-0 text-xl font-black text-slate-900 placeholder:text-slate-200 outline-none" />
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm focus-within:shadow-xl transition-all">
                   <label className="block text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Registry Slug</label>
                   <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-bold">/</span>
                      <input {...register('slug')} className="flex-1 bg-transparent border-none p-0 text-lg font-bold text-slate-500 outline-none" />
                   </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full" /> Narrative Infrastructure
                   </span>
                   {isReviewing && (
                     <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin text-primary-600" size={12} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Optimizing Narrative...</span>
                     </div>
                   )}
                </div>
                <div className="rounded-[3rem] overflow-hidden border border-slate-100 bg-white shadow-2xl shadow-slate-200/20 min-h-[700px]">
                   <TipTapEditor content={content} onChange={setContent} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-4">System Identity</h3>
                    <div className="space-y-6">
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Distribution Status</label>
                          <select {...register('status')} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none cursor-pointer">
                            <option value="draft">System Draft</option>
                            <option value="published">Global Release</option>
                          </select>
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Redirection Source</label>
                          <input {...register("external_url")} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none" placeholder="https://..." />
                       </div>
                    </div>
                 </div>
                 <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-primary-950/10 space-y-8 relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary-600/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-4 relative z-10">Visibility Matrix (SEO)</h3>
                    <div className="space-y-6 relative z-10">
                       <input {...register("meta_title")} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder:text-slate-700" placeholder="Meta Search Title..." />
                       <textarea {...register("meta_description")} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold h-32 resize-none placeholder:text-slate-700" placeholder="Strategic Meta Narrative..." />
                    </div>
                 </div>
              </div>
           </form>
        </div>

        {/* RIGHT COLUMN: Performance Archive & Live Synthesis */}
        <div className="lg:col-span-5 space-y-10 sticky top-12">
           
           <AnimatePresence>
              {reviewReport && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-10 rounded-[3rem] text-slate-900 shadow-2xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 text-primary-50 opacity-[0.4]"><BarChart size={64} /></div>
                   <div className="flex items-center justify-between mb-8 relative z-10">
                      <div>
                         <h3 className="text-xl font-black leading-none">Neural Audit Report</h3>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Authority Threshold Verification</p>
                      </div>
                      <div className={`px-6 py-3 rounded-2xl font-black text-sm border-2 ${reviewReport.overall_score >= 80 ? 'bg-green-50 border-green-100 text-green-700 shadow-lg shadow-green-200/40' : 'bg-red-50 border-red-100 text-red-700'}`}>
                         A-SCORE: {reviewReport.overall_score}/100
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 relative z-10">
                      {['structure_check', 'tone_check', 'hallucination_check', 'reference_check'].map((key) => (
                         <div key={key} className={`p-4 rounded-2xl bg-slate-50 border ${reviewReport[key]?.passed ? 'border-slate-100' : 'border-red-200 bg-red-50/20'}`}>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{key.replace('_', ' ')}</p>
                            {reviewReport[key]?.passed ? (
                               <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle2 size={12} />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Protocol Pass</span>
                               </div>
                            ) : (
                               <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Review Required</span>
                            )}
                         </div>
                      ))}
                   </div>
                   <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                      <button type="button" onClick={() => setShowShareModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-primary-600 shadow-xl transition-all active:scale-95 flex items-center gap-2">
                         <Share2 size={14} /> Export Content
                      </button>
                      <button type="button" onClick={() => triggerReview()} className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                         <Sparkles size={14} /> Re-Audit Data
                      </button>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>

           <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" /> Synthesis Projection
                 </span>
              </div>
              <div className="rounded-[4rem] p-10 md:p-14 border border-slate-100 bg-white shadow-2xl shadow-slate-200/20 min-h-[900px] relative">
                 <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none text-slate-900"><Terminal size={80} /></div>
                 <NewsletterRenderer content={content} hideLinks={true} stripReferences={true} />
                 {!content && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-200">
                       <Info size={40} className="animate-pulse" />
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
