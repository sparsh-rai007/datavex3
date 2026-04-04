'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import TipTapEditor from '@/components/TipTapEditor';
import NewsletterRenderer from '@/components/NewsletterRenderer';
import ShareModal from '@/components/ShareModal';
import { useForm } from 'react-hook-form';

// ── Types ────────────────────────────────────────────────────────────────────

type CheckResult = { passed: boolean; issues: string[] };

type ReviewResult = {
  structure_check:     CheckResult;
  tone_check:          CheckResult;
  hallucination_check: CheckResult;
  reference_check:     CheckResult;
  overall_score:       number;
};

// ── Component ────────────────────────────────────────────────────────────────

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id as string;

  const [content, setContent] = useState('');

  // Review state
  const [isReviewing, setIsReviewing]   = useState(false);
  const [review, setReview]             = useState<ReviewResult | null>(null);

  // Inline edit state
  const [editText, setEditText]         = useState('');
  const [editInstruction, setEditInstruction] = useState('');
  const [isEditing, setIsEditing]       = useState(false);
  const [editResult, setEditResult]     = useState('');
  const [showEditPanel, setShowEditPanel] = useState(false);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);

  const { register, setValue, handleSubmit, watch } = useForm();
  const currentStatus = watch('status');

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (e: any) => {
    const title = e.target.value;
    setValue('title', title);
    if (!watch('slug')?.trim()) setValue('slug', generateSlug(title));
  };

  useEffect(() => {
    apiClient.getBlog(blogId).then((data) => {
      setValue('title',            data.title);
      setValue('slug',             data.slug);
      setValue('excerpt',          data.excerpt);
      setValue('status',           data.status);
      setValue('meta_title',       data.meta_title       || '');
      setValue('meta_description', data.meta_description || '');
      setValue('meta_keywords',    data.meta_keywords    || '');
      setValue('external_url',     data.external_url     || '');
      setValue('generation_method', data.generation_method || 'manual');
      setValue('source_reference', data.source_reference || '');
      setContent(data.content);
    });
  }, [blogId, setValue]);

  const onSubmit = async (data: any) => {
    await apiClient.updateBlog(blogId, { ...data, content });
    router.push('/admin/blogs');
  };

  // ── AI Review ──────────────────────────────────────────────────────────────
  const handleReview = async () => {
    if (!content || content.trim().length < 50) {
      alert('Add some content before reviewing.');
      return;
    }
    setIsReviewing(true);
    setReview(null);
    try {
      const result = await apiClient.reviewBlog(content);
      setReview(result);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Review failed. Please try again.');
    } finally {
      setIsReviewing(false);
    }
  };

  // ── Inline Edit ────────────────────────────────────────────────────────────
  const handleEditSnippet = async () => {
    if (!editText.trim() || !editInstruction.trim()) {
      alert('Paste some text and enter an instruction.');
      return;
    }
    setIsEditing(true);
    setEditResult('');
    try {
      const { rewritten_text } = await apiClient.editSnippet(editText, editInstruction);
      setEditResult(rewritten_text);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Edit failed. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(editResult);
  };

  const getBlogUrl = () => {
    const externalUrl = (watch('external_url') || '').trim();
    if (externalUrl) return externalUrl;

    const slug = (watch('slug') || '').trim();
    if (!slug) return '';

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
    if (siteUrl) return `${siteUrl}/blog/${slug}`;

    if (typeof window !== 'undefined') return `${window.location.origin}/blog/${slug}`;
    return `/blog/${slug}`;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* TITLE */}
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            {...register('title')}
            onChange={handleTitleChange}
            className="input w-full"
          />
        </div>

        {/* SLUG */}
        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <input {...register('slug')} className="input w-full" />
        </div>

        {/* EXCERPT */}
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea {...register('excerpt')} className="input w-full" />
        </div>

        {/* CONTENT */}
        <div>
          <label className="block text-sm font-medium mb-2">Content *</label>
          <div className="rounded-xl overflow-hidden border bg-white mb-6">
            <TipTapEditor content={content} onChange={setContent} />
          </div>

          <label className="block text-sm font-medium mb-2">Live Preview</label>
          <div className="rounded-xl p-6 md:p-8 border bg-white shadow-sm min-h-[400px]">
            <NewsletterRenderer content={content} />
          </div>
        </div>

        {/* STATUS */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select {...register('status')} className="input w-full">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* EXTERNAL URL */}
        <div>
          <label className="block text-sm font-medium mb-1">External URL (Optional)</label>
          <input
            {...register('external_url')}
            className="input w-full"
            placeholder="https://medium.com/@your-article"
          />
          <p className="text-sm text-gray-500 mt-1">
            If added, Read More will open this link instead of the internal page.
          </p>
        </div>

        {/* SEO SETTINGS */}
        <div className="bg-white p-4 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">SEO Settings</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Title</label>
            <input {...register('meta_title')} className="input w-full" maxLength={60} placeholder="Recommended: 50-60 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Description</label>
            <textarea {...register('meta_description')} className="input w-full" maxLength={160} rows={3} placeholder="Recommended: 150-160 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Keywords (comma-separated)</label>
            <input {...register('meta_keywords')} className="input w-full" placeholder="AI, automation, marketing" />
          </div>
        </div>

        {/* ── INLINE EDIT PANEL ────────────────────────────────────────────── */}
        <div className="border rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowEditPanel(p => !p)}
            className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold"
          >
            <span>✏️ AI Inline Edit</span>
            <span className="text-gray-400">{showEditPanel ? '▲' : '▼'}</span>
          </button>

          {showEditPanel && (
            <div className="p-5 space-y-3 bg-white">
              <p className="text-xs text-gray-500">Paste a section of text, give an instruction, and get a rewrite you can copy back in.</p>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Original Text</label>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={4}
                  placeholder="Paste the paragraph or section you want to rewrite..."
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">Instruction</label>
                <input
                  value={editInstruction}
                  onChange={e => setEditInstruction(e.target.value)}
                  placeholder='e.g. "Make it sound more human", "Add a section reference for https://..."'
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleEditSnippet}
                disabled={isEditing}
                className="px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isEditing ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Rewriting...</>
                ) : '✏️ Rewrite'}
              </button>

              {editResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-600">Rewritten Text</label>
                    <button
                      type="button"
                      onClick={copyResult}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <pre className="bg-gray-50 border rounded-lg p-3 text-sm whitespace-pre-wrap font-sans">
                    {editResult}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── AI REVIEW PANEL ─────────────────────────────────────────────── */}
        {review && (
          <div className="bg-white border rounded-xl p-6 space-y-4">
            {/* Header with score */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">🔍 AI Review Report</h2>
              <span className={`text-2xl font-bold ${
                review.overall_score >= 80 ? 'text-green-600' :
                review.overall_score >= 50 ? 'text-yellow-500' : 'text-red-600'
              }`}>{review.overall_score}/100</span>
            </div>

            {/* 4-check grid */}
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'structure_check',     label: '🏗️ Structure',      data: review.structure_check     },
                { key: 'tone_check',          label: '🗣️ Tone',           data: review.tone_check          },
                { key: 'hallucination_check', label: '🧠 Hallucinations', data: review.hallucination_check },
                { key: 'reference_check',     label: '🔗 References',     data: review.reference_check     },
              ] as const).map(({ key, label, data }) => (
                <div
                  key={key}
                  className={`rounded-lg border p-3 ${data.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold ${data.passed ? 'text-green-700' : 'text-red-700'}`}>
                      {data.passed ? '✅ PASS' : '❌ FAIL'}
                    </span>
                    <span className="text-xs font-semibold text-gray-700">{label}</span>
                  </div>
                  {!data.passed && data.issues.length > 0 && (
                    <ul className="space-y-1 mt-1">
                      {data.issues.map((issue, i) => (
                        <li key={i} className="text-xs text-red-800">• {issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReview}
              disabled={isReviewing}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isReviewing ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Reviewing...</>
              ) : '🔍 AI Review'}
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              disabled={!content || content.trim().length < 50}
              className="px-6 py-3 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg font-semibold hover:bg-primary-100 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              📤 Share / Repurpose
            </button>
          </div>

          <button
            type="submit"
            disabled={isReviewing}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:bg-gray-400"
          >
            Save Changes
          </button>
        </div>

      </form>

      {/* Share/Repurpose Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={watch('title') || ''}
        content={content}
        blogUrl={getBlogUrl()}
      />
    </div>
  );
}
