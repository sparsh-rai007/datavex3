'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Loader2, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import TipTapEditor from '@/components/TipTapEditor';
import NewsletterRenderer from '@/components/NewsletterRenderer';
import { apiClient } from '@/lib/api';

type CronHealth = {
  status: 'healthy' | 'running' | 'failed';
  is_currently_running: boolean;
  last_successful_db_record: string | null;
  last_cron_execution: string | null;
  last_error: string | null;
};

type NewsletterDraft = {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
};

type ReviewResult = {
  structure_check: { passed: boolean; issues: string[] };
  tone_check: { passed: boolean; issues: string[] };
  hallucination_check: { passed: boolean; issues: string[] };
  reference_check: { passed: boolean; issues: string[] };
  overall_score: number;
};

export default function NewsletterAdminPage() {
  const [cronHealth, setCronHealth] = useState<CronHealth | null>(null);
  const [todayDraft, setTodayDraft] = useState<NewsletterDraft | null>(null);
  const [content, setContent] = useState('');
  const [reviewResults, setReviewResults] = useState<ReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastReviewedDraftId = useRef<string | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [health, newslettersResponse] = await Promise.all([
        apiClient.getNewsletterCronHealth(),
        apiClient.getNewsletters(),
      ]);

      const newsletters = Array.isArray(newslettersResponse?.newsletters)
        ? newslettersResponse.newsletters
        : [];

      const now = new Date();
      const todayDraftFromList = newsletters
        .filter((item: any) => {
          const createdAt = item?.created_at ? new Date(item.created_at) : null;
          return (
            item?.status === 'draft' &&
            !!createdAt &&
            createdAt.toDateString() === now.toDateString()
          );
        })
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

      const latestDraft =
        todayDraftFromList ||
        newsletters
          .filter((item: any) => item?.status === 'draft')
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0] ||
        null;

      setCronHealth(health);
      setTodayDraft(latestDraft);
      setContent(latestDraft?.content || '');
      setReviewResults(null);
      lastReviewedDraftId.current = null;
    } catch (err: any) {
      console.error('Failed loading newsletter dashboard data:', err);
      setError(err?.response?.data?.error || 'Failed to load newsletter dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runReview = useCallback(async (markdown: string) => {
    if (!markdown || markdown.trim().length < 50) {
      setReviewResults(null);
      return;
    }

    setIsReviewing(true);
    try {
      const result = await apiClient.reviewBlog(markdown);
      setReviewResults(result as ReviewResult);
    } catch (err) {
      console.error('Newsletter auto-review failed:', err);
      setReviewResults(null);
    } finally {
      setIsReviewing(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (!todayDraft?.id || !todayDraft?.content) {
      return;
    }

    if (lastReviewedDraftId.current === todayDraft.id) {
      return;
    }

    lastReviewedDraftId.current = todayDraft.id;
    void runReview(todayDraft.content);
  }, [todayDraft, runReview]);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      await apiClient.regenerateTodayNewsletter();
      await loadInitialData();
    } catch (err: any) {
      console.error('Failed to regenerate newsletter:', err);
      setError(err?.response?.data?.error || 'Regeneration failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!todayDraft?.id || isPublishing) {
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      await apiClient.publishNewsletter(todayDraft.id, {
        title: todayDraft.title,
        content,
      });
      await loadInitialData();
    } catch (err: any) {
      console.error('Failed to publish newsletter:', err);
      setError(err?.response?.data?.error || 'Publish failed');
    } finally {
      setIsPublishing(false);
    }
  };

  const formatTime = (value: string | null) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={36} className="animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1500px] mx-auto space-y-8">
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col items-center justify-center text-white px-6 text-center">
          <Loader2 size={48} className="animate-spin mb-6 text-primary-500" />
          <h2 className="text-3xl font-black mb-3">Regenerating Today&apos;s Edition</h2>
          <p className="text-slate-300 font-medium max-w-xl">
            Scanning RSS feeds and writing new draft... This takes about 15 seconds.
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Daily Tech Newsletter</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Automation dashboard and draft editor</p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-primary-600 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
          Regenerate Today&apos;s Edition
        </button>
      </div>

      <div
        className={`rounded-2xl px-5 py-4 border flex items-center gap-3 ${
          cronHealth?.is_currently_running
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : cronHealth?.status === 'failed'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-800'
        }`}
      >
        {cronHealth?.is_currently_running ? (
          <>
            <Activity size={18} className="animate-pulse" />
            <span className="font-bold">Cron is currently generating...</span>
          </>
        ) : cronHealth?.status === 'failed' ? (
          <>
            <AlertTriangle size={18} />
            <span className="font-bold">Automation failed:</span>
            <span>{cronHealth?.last_error || 'Unknown error'}</span>
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            <span className="font-bold">
              Automation Active - Last run: {formatTime(cronHealth?.last_cron_execution || null)}
            </span>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 text-sm text-slate-600">
        <span className="font-semibold">Last successful DB record:</span>{' '}
        {formatTime(cronHealth?.last_successful_db_record || null)}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {!todayDraft ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-2">No draft generated for today yet</h2>
          <p className="text-slate-500 mb-6">Trigger the automation manually to create today&apos;s draft.</p>
          <button
            onClick={handleRegenerate}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-600 text-white font-black hover:bg-primary-700 transition"
          >
            <RefreshCw size={18} />
            Force Run Automation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className={`xl:col-span-8 space-y-4 ${isGenerating ? 'pointer-events-none opacity-40' : ''}`}>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-xl font-black text-slate-900">{todayDraft.title || 'Untitled Newsletter'}</h2>
              <p className="text-slate-500 text-sm">Draft created at: {formatTime(todayDraft.created_at)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <TipTapEditor content={content} onChange={setContent} />
            </div>
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900">AI Review Checklist</h3>
                {isReviewing && <Loader2 size={18} className="animate-spin text-primary-600" />}
              </div>

              {!reviewResults ? (
                <p className="text-sm text-slate-500">No review yet. Loading auto-review...</p>
              ) : (
                <div className="space-y-3">
                  {[
                    { key: 'structure_check', label: 'Structure Check' },
                    { key: 'tone_check', label: 'Tone Check' },
                    { key: 'hallucination_check', label: 'Hallucination Check' },
                    { key: 'reference_check', label: 'Reference Check' },
                  ].map((item) => {
                    const result = (reviewResults as any)[item.key];
                    return (
                      <div
                        key={item.key}
                        className={`rounded-xl px-4 py-3 border text-sm font-medium ${
                          result?.passed
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                      >
                        {result?.passed ? 'PASS' : 'FAIL'} - {item.label}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-sm text-slate-600 font-semibold mb-3">
                  Overall Score: {reviewResults?.overall_score ?? 'N/A'}
                </p>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || isGenerating}
                  className="w-full px-4 py-3 rounded-xl font-black text-sm uppercase tracking-wider bg-slate-900 text-white"
                >
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-black text-slate-900 mb-4">Live Preview</h3>
              <div className="max-h-[480px] overflow-auto">
                <NewsletterRenderer content={content} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
