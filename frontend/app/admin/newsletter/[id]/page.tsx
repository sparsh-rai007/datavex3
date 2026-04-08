'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import TipTapEditor from '@/components/TipTapEditor';
import NewsletterRenderer from '@/components/NewsletterRenderer';

type CheckResult = { passed: boolean; issues: string[] };

type ReviewResult = {
  structure_check: CheckResult;
  tone_check: CheckResult;
  hallucination_check: CheckResult;
  reference_check: CheckResult;
  overall_score: number;
};

type NewsletterForm = {
  title: string;
  status: 'draft' | 'published' | 'sent';
};

export default function EditNewsletterPage() {
  const params = useParams();
  const router = useRouter();
  const newsletterId = params.id as string;

  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue } = useForm<NewsletterForm>({
    defaultValues: {
      title: '',
      status: 'draft',
    },
  });

  useEffect(() => {
    const loadNewsletter = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getNewsletter(newsletterId);
        setValue('title', data.title || '');
        setValue('status', (data.status || 'draft') as NewsletterForm['status']);
        setContent(data.content || '');
      } catch (err: any) {
        console.error('Failed to load newsletter:', err);
        setError(err?.response?.data?.error || 'Failed to load newsletter');
      } finally {
        setLoading(false);
      }
    };

    if (newsletterId) {
      void loadNewsletter();
    }
  }, [newsletterId, setValue]);

  const onSubmit = async (data: NewsletterForm) => {
    if (saving) return;

    setSaving(true);
    setError(null);
    try {
      await apiClient.updateNewsletter(newsletterId, {
        title: data.title,
        content,
        status: data.status,
      });
      router.push('/admin/newsletter');
    } catch (err: any) {
      console.error('Failed to save newsletter:', err);
      setError(err?.response?.data?.error || 'Failed to save newsletter');
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async () => {
    if (!content || content.trim().length < 50) {
      alert('Add more content before running AI review.');
      return;
    }

    setIsReviewing(true);
    setReview(null);
    try {
      const result = await apiClient.reviewBlog(content);
      setReview(result as ReviewResult);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Review failed. Please try again.');
    } finally {
      setIsReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Edit Newsletter</h1>
        <p className="text-slate-500 text-sm mt-1">Update newsletter content and publication status.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input {...register('title', { required: true })} className="input w-full" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select {...register('status')} className="input w-full">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="sent">Sent</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">Content</h2>
          </div>
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900">AI Review</h2>
            <button
              type="button"
              onClick={handleReview}
              disabled={isReviewing}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition disabled:opacity-60 inline-flex items-center gap-2"
            >
              {isReviewing && <Loader2 size={14} className="animate-spin" />}
              {isReviewing ? 'Reviewing...' : 'Run Review'}
            </button>
          </div>

          {!review ? (
            <p className="text-sm text-slate-500">Run AI review to validate structure, tone, and references.</p>
          ) : (
            <div className="space-y-3">
              {[
                { key: 'structure_check', label: 'Structure Check' },
                { key: 'tone_check', label: 'Tone Check' },
                { key: 'hallucination_check', label: 'Hallucination Check' },
                { key: 'reference_check', label: 'Reference Check' },
              ].map((item) => {
                const result = (review as any)[item.key];
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
              <p className="text-sm font-semibold text-slate-700 pt-1">Overall Score: {review.overall_score}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-lg font-black text-slate-900 mb-4">Live Preview</h2>
          <NewsletterRenderer content={content} hideLinks={true} />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving || isReviewing}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
