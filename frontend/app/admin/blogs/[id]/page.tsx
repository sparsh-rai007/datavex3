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

        <button className="px-6 py-2 bg-primary-600 text-white rounded-lg">
          Save Changes
        </button>

      </form>
    </div>
  );
}
