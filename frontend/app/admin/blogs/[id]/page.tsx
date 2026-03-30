'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import TipTapEditor from '@/components/TipTapEditor';
import { useForm } from 'react-hook-form';

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const blogId = params.id as string;

  const [content, setContent] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [review, setReview] = useState<{
    score: number;
    factual_warnings: string[];
    formatting_errors: string[];
    general_feedback: string;
  } | null>(null);

  const { register, setValue, handleSubmit, watch } = useForm();

  // ---------------------------------------------------------
  // ⭐ 1️⃣ Slug generator function
  // ---------------------------------------------------------
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // ---------------------------------------------------------
  // ⭐ 2️⃣ Handle title change (auto-slug if slug is empty)
  // ---------------------------------------------------------
  const handleTitleChange = (e: any) => {
    const title = e.target.value;
    setValue("title", title);

    const currentSlug = watch("slug");

    // Only auto-fill slug if user hasn't manually edited it
    if (!currentSlug || currentSlug.trim() === "") {
      setValue("slug", generateSlug(title));
    }
  };

  // ---------------------------------------------------------
  // ⭐ 3️⃣ Load existing data
  // ---------------------------------------------------------
  useEffect(() => {
    apiClient.getBlog(blogId).then((data) => {
      setValue('title', data.title);
      setValue('slug', data.slug);
      setValue('excerpt', data.excerpt);
      setValue('status', data.status);
      setContent(data.content);
      setValue('meta_title', data.meta_title || "");
    setValue('meta_description', data.meta_description || "");
    setValue('meta_keywords', data.meta_keywords || "");
    setValue("external_url", data.external_url || "");

    });
  }, [blogId, setValue]);

  const onSubmit = async (data: any) => {
    await apiClient.updateBlog(blogId, { ...data, content });
    router.push('/admin/blogs');
  };

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

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ⭐ TITLE */}
        <div>
          <label>Title *</label>
          <input 
            {...register('title')}
            onChange={handleTitleChange}      // ⭐ apply auto-slug logic
            className="input w-full" 
          />
        </div>

        {/* ⭐ SLUG */}
        <div>
          <label>Slug *</label>
          <input {...register('slug')} className="input w-full" />
        </div>

        {/* EXCERPT */}
        <div>
          <label>Excerpt</label>
          <textarea {...register('excerpt')} className="input w-full" />
        </div>

        {/* CONTENT */}
        <div>
          <label>Content *</label>
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        {/* STATUS */}
        <div>
          <label>Status</label>
          <select {...register('status')} className="input w-full">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        {/* EXTERNAL URL */}
<div>
  <label>External URL (Optional)</label>
  <input
    {...register("external_url")}
    className="input w-full"
    placeholder="https://medium.com/@your-article"
  />
  <p className="text-sm text-gray-500">
    If added, Read More will open this link instead of the internal page.
  </p>
</div>

{/* ⭐ SEO SETTINGS */}
<div className="bg-white p-4 rounded-lg border space-y-4">
  <h2 className="text-lg font-semibold">SEO Settings</h2>

  <div>
    <label>Meta Title</label>
    <input
      {...register("meta_title")}
      className="input w-full"
      maxLength={60}
      placeholder="Recommended: 50-60 characters"
    />
  </div>

  <div>
    <label>Meta Description</label>
    <textarea
      {...register("meta_description")}
      className="input w-full"
      maxLength={160}
      rows={3}
      placeholder="Recommended: 150-160 characters"
    />
  </div>

  <div>
    <label>Meta Keywords (comma-separated)</label>
    <input
      {...register("meta_keywords")}
      className="input w-full"
      placeholder="Example: AI, automation, marketing"
    />
  </div>
</div>

        {/* AI REVIEW PANEL */}
        {review && (
          <div className="bg-white border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">🔍 AI Review Report</h2>
              <span className={`text-2xl font-bold ${
                review.score >= 80 ? 'text-green-600' :
                review.score >= 50 ? 'text-yellow-500' : 'text-red-600'
              }`}>{review.score}/100</span>
            </div>

            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg italic">
              {review.general_feedback}
            </p>

            {review.factual_warnings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-orange-700 mb-2">⚠️ Factual Warnings</h3>
                <ul className="space-y-1">
                  {review.factual_warnings.map((w, i) => (
                    <li key={i} className="text-sm text-orange-800 bg-orange-50 px-3 py-2 rounded-lg">• {w}</li>
                  ))}
                </ul>
              </div>
            )}

            {review.formatting_errors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-700 mb-2">❌ Formatting / Citation Errors</h3>
                <ul className="space-y-1">
                  {review.formatting_errors.map((e, i) => (
                    <li key={i} className="text-sm text-red-800 bg-red-50 px-3 py-2 rounded-lg">• {e}</li>
                  ))}
                </ul>
              </div>
            )}

            {review.factual_warnings.length === 0 && review.formatting_errors.length === 0 && (
              <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">✅ No issues found — looks great!</p>
            )}
          </div>
        )}

        <div className="pt-4 border-t flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReview}
            disabled={isReviewing}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isReviewing ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              Reviewing...</>
            ) : '🔍 AI Review'}
          </button>

          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg">
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
}
