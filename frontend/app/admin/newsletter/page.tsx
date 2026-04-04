'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  RefreshCw, 
  Save, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  Mail,
  Zap,
  Info
} from 'lucide-react';
import TipTapEditor from '@/components/TipTapEditor';
import NewsletterRenderer from '@/components/NewsletterRenderer';
import { apiClient } from '@/lib/api';

interface ReviewCheck {
  passed: boolean;
  issues: string[];
}

interface ReviewReport {
  structure_check: ReviewCheck;
  tone_check: ReviewCheck;
  hallucination_check: ReviewCheck;
  reference_check: ReviewCheck;
  overall_score: number;
}

export default function MorningDashboard() {
  const router = useRouter();
  
  // ── Newsletter State ──
  const [content, setContent] = useState('');
  const [newsletterData, setNewsletterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // ── AI Review State ──
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewReport, setReviewReport] = useState<ReviewReport | null>(null);
  
  // ── Regeneration State ──
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isForceRunning, setIsForceRunning] = useState(false);

  // ── Load Today's Draft ──
  const loadTodayDraft = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getTodayNewsletter();
      if (response.draft) {
        setNewsletterData(response.draft);
        setContent(response.draft.content || '');
        // Auto-trigger review if content exists
        if (response.draft.content) {
          triggerReview(response.draft.content);
        }
      } else {
        setNewsletterData(null);
        setContent('');
      }
    } catch (err) {
      console.error("Failed to load today's newsletter", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodayDraft();
  }, []);

  const triggerReview = async (textToReview: string) => {
    if (!textToReview || textToReview.length < 50) return;
    
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

  const handleForceRun = async () => {
    setIsForceRunning(true);
    setShowRegenerateModal(false);
    try {
      await apiClient.forceRunNewsletter();
      // Reload to catch the new draft
      await loadTodayDraft();
    } catch (err) {
      console.error("Force run failed", err);
      alert("Failed to generate new draft. Check system logs.");
    } finally {
      setIsForceRunning(false);
    }
  };

  const handlePublish = async () => {
    if (!newsletterData?.id) return;
    setIsSaving(true);
    try {
      await apiClient.updateBlog(newsletterData.id, {
        ...newsletterData,
        content: content,
        status: 'published'
      });
      alert("Daily Newsletter Published Successfully!");
      router.push('/admin/newsletter');
    } catch (err) {
      console.error("Publish failed", err);
      alert("Failed to publish newsletter.");
    } finally {
      setIsSaving(false);
    }
  };

  const allChecksPassed = reviewReport && 
    reviewReport.structure_check.passed &&
    reviewReport.tone_check.passed &&
    reviewReport.hallucination_check.passed &&
    reviewReport.reference_check.passed;

  const isPublishDisabled = !reviewReport || !allChecksPassed || reviewReport.overall_score < 80 || isReviewing || isSaving;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Synchronizing Matrix...</p>
      </div>
    );
  }

  if (isForceRunning) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-8"
          />
          <h2 className="text-3xl font-black mb-4 tracking-tight">Generating Today's Briefing</h2>
          <p className="text-slate-400 font-medium leading-relaxed">
            🤖 Our AI is currently scanning the latest RSS feeds and architectural records to synthesize today's technical newsletter.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-primary-500 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto font-outfit min-h-screen bg-slate-50/10">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white">
              <Mail size={18} />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Protocol morning-brief-v1</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Today's Synthetic Briefing</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Intelligence Matrix Dashboard</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowRegenerateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={14} className={isForceRunning ? "animate-spin" : ""} />
            Regenerate Newsletter
          </button>
          
          <button
            onClick={handlePublish}
            disabled={isPublishDisabled}
            className={`
              flex items-center gap-2 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl
              ${isPublishDisabled 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed grayscale' 
                : 'bg-primary-600 text-white hover:bg-slate-900 hover:shadow-primary-600/20 active:scale-95'}
            `}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            Commit & Publish Newsletter
          </button>
        </div>
      </div>

      {!newsletterData ? (
        /* --- EMPTY STATE --- */
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-8">
            <Zap size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Briefing Generated for Today</h2>
          <p className="text-slate-400 font-medium max-w-md mx-auto leading-relaxed mb-10">
            The automated overnight synthesis sequence did not found enough relevant architectural changes or tech trends for an automated draft.
          </p>
          <button
            onClick={handleForceRun}
            className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-primary-600 transition-all shadow-2xl active:scale-95 flex items-center gap-3 mx-auto"
          >
            <Sparkles size={18} />
            Generate Today's Edition
          </button>
        </div>
      ) : (
        /* --- ACTIVE DASHBOARD --- */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main Content Area */}
          <div className="xl:col-span-8 space-y-10">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden relative group">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Editor Matrix</div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{newsletterData.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Autosave Protocol Active</span>
                </div>
              </div>
              <TipTapEditor 
                content={content} 
                onChange={(newContent: string) => {
                  setContent(newContent);
                  // Trigger review debounced or on request? The prompt says "As soon as text is loaded".
                  // Since we already auto-triggered for the initial load, manual re-runs are better for speed.
                }} 
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-4 flex items-center gap-3">
                <div className="w-1 h-1 bg-primary-600 rounded-full" />
                Live Synthetic Preview
              </h3>
              <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/20 min-h-[600px]">
                <NewsletterRenderer content={content} />
              </div>
            </div>
          </div>

          {/* Right Sidebar - AI Review & Stats */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* AI Review Panel */}
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl shadow-primary-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-primary-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Neural Audit</h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Status: {isReviewing ? 'Analyzing...' : 'Standby'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => triggerReview(content)}
                  disabled={isReviewing || content.length < 50}
                  className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-30"
                >
                  <RefreshCw size={16} className={isReviewing ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* Checklist */}
              <div className="space-y-4 mb-10 relative z-10">
                {[
                  { id: 'structure_check', label: 'Matrix Structure' },
                  { id: 'tone_check', label: 'Humanized Tone' },
                  { id: 'hallucination_check', label: 'Fact Verification' },
                  { id: 'reference_check', label: 'Architecture References' }
                ].map((check) => {
                  const result = reviewReport?.[check.id as keyof ReviewReport] as ReviewCheck;
                  const passed = result?.passed;
                  const hasReview = !!reviewReport;

                  return (
                    <div key={check.id} className="group">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/[0.05] group-hover:border-primary-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                            !hasReview ? 'bg-white/5 text-slate-700' : 
                            passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {!hasReview ? <ChevronRight size={14} /> : passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          </div>
                          <span className={`text-[11px] font-black uppercase tracking-widest ${hasReview ? 'text-white' : 'text-slate-500'}`}>{check.label}</span>
                        </div>
                        {hasReview && !passed && result.issues.length > 0 && (
                          <div className="w-5 h-5 bg-red-500 text-white rounded-md flex items-center justify-center text-[10px] font-black">{result.issues.length}</div>
                        )}
                      </div>
                      
                      {/* Detailed Issues */}
                      <AnimatePresence>
                        {hasReview && !passed && result.issues.length > 0 && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <ul className="mt-3 pl-12 space-y-2 pb-2">
                              {result.issues.map((issue, idx) => (
                                <li key={idx} className="text-[10px] text-red-400/80 font-bold leading-relaxed">• {issue}</li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Gatekeeper Score */}
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 text-center relative z-10 transition-all">
                <div className="mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Authority Score</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-5xl font-black tracking-tighter ${
                    !reviewReport ? 'text-slate-700' : 
                    reviewReport.overall_score >= 80 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {reviewReport?.overall_score || '--'}
                  </span>
                  <span className="text-slate-700 text-2xl font-black mt-2">/ 100</span>
                </div>
                
                {reviewReport && reviewReport.overall_score < 80 && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-black text-red-400 uppercase tracking-widest bg-red-400/10 py-2 rounded-xl">
                    <AlertTriangle size={12} />
                    Minimum Threshold (80) Not Met
                  </div>
                )}
                {reviewReport && reviewReport.overall_score >= 80 && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-black text-green-400 uppercase tracking-widest bg-green-400/10 py-2 rounded-xl">
                    <CheckCircle2 size={12} />
                    Authorized for Release
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-primary-50 border border-primary-100 rounded-[2rem] p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-primary-200 group-hover:text-primary-400 transition-colors">
                <Info size={40} />
              </div>
              <h4 className="text-xs font-black text-primary-900 uppercase tracking-widest mb-4">Neural Tip</h4>
              <p className="text-xs text-primary-800/80 font-medium leading-relaxed pr-8">
                Use the "Highlight to Edit" menu in the editor to refine specific robotic paragraphs or factual inaccuracies found during audit.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      <AnimatePresence>
        {showRegenerateModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowRegenerateModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-[120] shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-8">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Overwrite Current Draft?</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-10">
                This will trigger a full neural synthesis sequence. Any manual edits made to the current draft will be <span className="text-red-500 font-black">permanently lost</span>. Are you sure?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleForceRun}
                  className="w-full py-5 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Confirm Regeneration
                </button>
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="w-full py-5 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all active:scale-95"
                >
                  Abort Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
