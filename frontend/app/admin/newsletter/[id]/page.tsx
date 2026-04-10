'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import TipTapEditor from '@/components/TipTapEditor';
import ShareModal from '@/components/ShareModal';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Save,
  Sparkles,
  Loader2,
  Share2,
  BarChart,
  Terminal,
  Info,
  Edit3,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Globe,
  Settings,
  Eye,
  History,
  Layout,
  Search,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NewsletterRenderer from '@/components/NewsletterRenderer';

export default function EditNewsletterPage() {
  const params = useParams();
  const router = useRouter();
  const newsletterId = params.id as string;

  const [content, setContent] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewReport, setReviewReport] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const { register, setValue, handleSubmit, watch } = useForm();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await apiClient.getNewsletter(newsletterId);
        setValue('title', data.title || '');
        setValue('status', data.status || 'draft');
        setContent(data.content || '');
        setLoading(false);
        if (data.content) triggerReview(data.content);
      } catch (err) {
        console.error("Load failed", err);
        setLoading(false);
      }
    };
    loadData();
  }, [newsletterId, setValue]);

  const triggerReview = async (overrideContent?: string) => {
    const textToReview = overrideContent ?? content;
    if (!textToReview || textToReview.trim().length < 50) return;
    setIsReviewing(true);
    try {
      const result = await apiClient.reviewBlog(textToReview); // Using same service for newsletters
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
      await apiClient.updateNewsletter(newsletterId, { ...data, content });
      router.push('/admin/newsletter');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update newsletter.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-outfit">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"
        />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Synching Neural Node...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-outfit text-slate-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/admin/newsletter')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="flex flex-col min-w-0 max-w-[500px]">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Layout size={12} />
                <span>Intelligence Briefing</span>
                <span className="text-slate-300">/</span>
                <span className="text-indigo-600">Modify Stream</span>
              </div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight mt-0.5 break-words">
                {watch('title') || 'Untitled Briefing'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'editor' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <Edit3 size={14} /> Editor
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'preview' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <Eye size={14} /> Preview
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
            >
              <Share2 size={18} />
              <span>Export & Share</span>
            </button>

            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>Sync Matrix</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'editor' ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-10 border-b border-slate-100 bg-slate-50/30">
                    <input
                      {...register('title')}
                      placeholder="Briefing title..."
                      className="w-full text-5xl font-black text-slate-900 placeholder:text-slate-200 outline-none bg-transparent tracking-tight mb-6"
                    />
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                       <History size={14} />
                       <span>Neural Signature: {newsletterId}</span>
                    </div>
                  </div>

                  <div className="editor-container max-h-[700px] overflow-y-auto">
                    <TipTapEditor content={content} onChange={setContent} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-[3rem] p-12 md:p-20 border border-slate-200 shadow-sm min-h-[1000px]"
              >
                <NewsletterRenderer content={content} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                <Settings size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Stream Control</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lifecycle Status</label>
                <div className="relative group">
                  <select
                    {...register('status')}
                    className="w-full bg-slate-50 border border-slate-100 hover:border-indigo-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none cursor-pointer transition-all appearance-none"
                  >
                    <option value="draft">Draft Protocol</option>
                    <option value="published">Release to Archive</option>
                    <option value="sent">Dispatched to Hubs</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <Zap size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Neural Audit</h3>
              </div>
              {isReviewing && <Loader2 size={14} className="animate-spin text-indigo-600" />}
            </div>

            <div className="p-6 space-y-6">
              {reviewReport ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 border-indigo-100 text-indigo-600 bg-white shadow-xl">
                      <span className="text-2xl font-black leading-none">{reviewReport.overall_score}</span>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Score</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Briefing Integrity</p>
                      <p className="text-[10px] text-slate-500 font-medium">Neural coherence analysis.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'structure_check', label: 'Semantic Flux', icon: BarChart },
                      { key: 'tone_check', label: 'Neural Tone', icon: User },
                      { key: 'hallucination_check', label: 'Fact Fidelity', icon: Info },
                      { key: 'reference_check', label: 'Source Matrix', icon: Share2 },
                    ].map(({ key, label, icon: Icon }) => {
                      const check = reviewReport[key];
                      const isExpanded = expandedAudit === key;
                      const hasIssues = check && !check.passed && check.issues?.length > 0;

                      return (
                        <div key={key} className="space-y-2">
                          <div
                            onClick={() => hasIssues && setExpandedAudit(isExpanded ? null : key)}
                            className={`flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-all ${hasIssues ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={14} className="text-slate-400" />
                              <span className="text-[11px] font-bold text-slate-600">{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {check?.passed ? (
                                <CheckCircle2 size={14} className="text-green-500" />
                              ) : (
                                <>
                                  <AlertTriangle size={14} className="text-amber-500" />
                                  {hasIssues && (
                                    <ChevronDown
                                      size={14}
                                      className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  )}
                                </>
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
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
                                  <div className="flex items-center gap-2 text-amber-700">
                                    <AlertTriangle size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Neural Alert</span>
                                  </div>
                                  {check.issues.map((issue: string, i: number) => (
                                    <p key={i} className="text-[10px] text-amber-800 font-medium leading-relaxed">• {issue}</p>
                                  ))}
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
                    className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[11px] font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} /> Re-Audit Matrix
                  </button>
                </>
              ) : (
                <div className="py-8 text-center space-y-4 font-outfit">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mx-auto">
                    <Zap size={24} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">No audit data available.</p>
                  <button onClick={() => triggerReview()} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 transition-all">Inaugurate Audit</button>
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
        blogUrl={mounted ? `${window.location.origin}/newsletter/${newsletterId}` : ''}
      />
    </div>
  );
}
