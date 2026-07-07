'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Edit3,
  Loader2,
  Save,
  ArrowLeft,
  Terminal,
  User,
  Briefcase,
  BarChart,
  GraduationCap,
  ChevronDown,
  Share2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Settings,
  Layout,
  Search,
  Zap,
  Eye,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import TipTapEditor, { AuditIssue } from '@/components/TipTapEditor';
import { apiClient } from '@/lib/api';
import NewsletterRenderer from '@/components/NewsletterRenderer';

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id as string;

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewReport, setReviewReport] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const editorRef = useRef<any>(null);

  const { register, handleSubmit, watch, setValue } = useForm();

  useEffect(() => {
    setLoading(true);
    apiClient.getBlog(blogId).then((data) => {
      setValue('title', data.title || '');
      setValue('slug', data.slug || '');
      setValue('status', data.status || 'draft');
      setValue('meta_title', data.meta_title || '');
      setValue('meta_description', data.meta_description || '');
      setValue('meta_keywords', data.meta_keywords || '');
      setValue('excerpt', data.excerpt || '');
      setContent(data.content || '');
      setLoading(false);
      if (data.content) triggerReview(data.content);
    }).catch(err => {
      console.error("Load failed", err);
      setLoading(false);
    });
  }, [blogId, setValue]);

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (e: any) => {
    const title = e.target.value;
    setValue("title", title);
    if (!watch("slug")?.trim()) setValue("slug", generateSlug(title));
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

  const onSubmit = async (data: any) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await apiClient.updateBlog(blogId, { ...data, content });
      router.push('/admin/blogs');
    } catch (error) {
      alert('Failed to update publication.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] font-sans">
        <Loader2 className="animate-spin text-slate-400 mb-4" size={32} />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest text-[10px]">Retrieving record</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/blogs')}
            className="p-2 hover:bg-slate-100 rounded-md transition-colors text-slate-500"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Layout size={10} />
              <span>Articles</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">Edit</span>
            </div>
            <h1 className="text-sm font-semibold text-slate-900 truncate max-w-[300px]">
              {watch('title') || 'Untitled Article'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-md mr-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${activeTab === 'editor' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded text-[11px] font-semibold transition-all ${activeTab === 'preview' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="h-9 px-4 bg-white border border-slate-200 text-slate-600 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="h-9 px-6 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-8">
          {activeTab === 'editor' && (
            <>
              {/* Main Editor Card */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                  <textarea
                    {...register('title')}
                    onChange={(e) => {
                      handleTitleChange(e);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    rows={1}
                    placeholder="Article Title"
                    className="w-full text-3xl font-bold text-slate-900 placeholder:text-slate-200 outline-none bg-transparent tracking-tight mb-4 resize-none overflow-hidden"
                  />
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                    <Globe size={12} />
                    <span>domain.com/blog/</span>
                    <input
                      {...register('slug')}
                      className="bg-slate-100 px-2 py-0.5 rounded border-none focus:ring-1 focus:ring-slate-200 text-slate-900 font-mono w-auto min-w-[150px]"
                      placeholder="url-slug"
                    />
                  </div>
                </div>

                {/* Excerpt Field */}
                <div className="px-8 pb-8 pt-0 border-b border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Short Summary (Excerpt)</label>
                  <textarea
                    {...register('excerpt')}
                    rows={2}
                    placeholder="Short summary for the archive list..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm font-medium text-slate-600 focus:ring-1 focus:ring-slate-900 outline-none transition-all resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 ml-1 italic font-medium">This will be shown on the main blog archive before users click into the full record.</p>
                </div>

                <div className="min-h-[600px]">
                  <TipTapEditor ref={editorRef} content={content} onChange={setContent} />
                </div>
              </div>

              {/* SEO Section */}
              <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    <Search size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">SEO Configuration</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meta Title</label>
                      <input
                        {...register('meta_title')}
                        className="w-full h-10 bg-slate-50 border border-slate-100 rounded-md px-4 text-sm font-medium text-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                        placeholder="Search engine title..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Keywords</label>
                      <input
                        {...register('meta_keywords')}
                        className="w-full h-10 bg-slate-50 border border-slate-100 rounded-md px-4 text-sm font-medium text-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all"
                        placeholder="React, TypeScript, AI..."
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meta Description</label>
                    <textarea
                      {...register('meta_description')}
                      className="w-full h-[116px] bg-slate-50 border border-slate-100 rounded-md p-4 text-sm font-medium text-slate-700 focus:ring-1 focus:ring-slate-900 outline-none transition-all resize-none leading-relaxed"
                      placeholder="Brief summary for search results..."
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'preview' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-200 rounded-xl p-12 md:p-20 shadow-[0_1px_3px_rgba(0,0,0,0.05)] min-h-[800px]"
            >
              <NewsletterRenderer content={content} />
            </motion.div>
          )}
        </div>

        <aside className="space-y-6">
          {/* Publishing Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <Settings size={16} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Publishing</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <div className="relative">
                  <select
                    {...register('status')}
                    className="w-full h-10 bg-slate-50 border border-slate-100 rounded-md px-4 text-sm font-bold text-slate-700 outline-none cursor-pointer appearance-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Quality Audit */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-sm">
                  <ShieldCheck size={16} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Quality Audit</h3>
              </div>
              {isReviewing && <Loader2 size={14} className="animate-spin text-slate-900" />}
            </div>

            <div className="p-6 space-y-6">
              {reviewReport ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center bg-white shadow-sm ${reviewReport.overall_score >= 80 ? 'border-emerald-100 text-emerald-600' : 'border-amber-100 text-amber-600'}`}>
                      <span className="text-xl font-bold leading-none">{reviewReport.overall_score}</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">Score</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Audit Complete</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {reviewReport.overall_score >= 80 ? "High quality content." : "Optimization recommended."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { key: 'structure_check', label: 'Structure', icon: BarChart },
                      { key: 'tone_check', label: 'Voice Tone', icon: User },
                      { key: 'hallucination_check', label: 'Fact Check', icon: Info },
                    ].map(({ key, label, icon: Icon }) => {
                      const check = reviewReport[key];
                      const isExpanded = expandedAudit === key;
                      const hasIssues = check && !check.passed && check.issues?.length > 0;

                      return (
                        <div key={key} className="space-y-1">
                          <div
                            onClick={() => hasIssues && setExpandedAudit(isExpanded ? null : key)}
                            className={`flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 transition-all ${hasIssues ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon size={12} className="text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {check?.passed ? (
                                <CheckCircle2 size={14} className="text-emerald-500" />
                              ) : (
                                <AlertTriangle size={14} className="text-amber-500" />
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && hasIssues && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 mt-1">
                                  {check.issues.map((issueItem: any, i: number) => {
                                    const auditIssue: AuditIssue = {
                                      id: `${key}-${i}`,
                                      message: issueItem.message || String(issueItem),
                                      location_snippet: issueItem.location_snippet || ''
                                    };

                                    return (
                                      <p 
                                        key={i} 
                                        onClick={() => editorRef.current?.navigateToIssue(auditIssue)}
                                        className="text-[10px] text-amber-800 font-medium leading-relaxed hover:underline cursor-pointer transition-all mb-1 last:mb-0"
                                      >
                                        • {auditIssue.message}
                                      </p>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => triggerReview()}
                    disabled={isReviewing}
                    className="w-full py-2.5 bg-slate-100 text-slate-900 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} /> Re-Audit
                  </button>
                </>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 mx-auto">
                    <ShieldCheck size={20} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">No Audit Data</p>
                  <button
                    onClick={() => triggerReview()}
                    className="px-6 py-2 bg-slate-900 text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all mx-auto block"
                  >
                    Start Audit
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={watch('title') || ''}
        content={content}
        blogUrl={typeof window !== 'undefined' ? `${window.location.origin}/blog/${watch('slug')}` : ''}
      />
    </div>
  );
}

function ShareModal({ isOpen, onClose, title, content, blogUrl }: { isOpen: boolean, onClose: () => void, title: string, content: string, blogUrl: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider">Export & Share</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Ready to share <span className="font-bold text-slate-900">"{title}"</span>? Choose your export format or copy the public link.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(blogUrl);
                alert('Copied to clipboard!');
              }}
              className="w-full h-11 bg-slate-50 border border-slate-100 rounded-md px-4 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-between group"
            >
              <span>Copy Public Link</span>
              <ExternalLink size={14} className="text-slate-400 group-hover:text-slate-900" />
            </button>
            <button className="w-full h-11 bg-slate-50 border border-slate-100 rounded-md px-4 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all flex items-center justify-between group">
              <span>Download as PDF</span>
              <Save size={14} className="text-slate-400 group-hover:text-slate-900" />
            </button>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="h-9 px-4 bg-slate-900 text-white rounded-md text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
