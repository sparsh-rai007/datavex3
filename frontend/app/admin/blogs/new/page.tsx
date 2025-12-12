'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import TipTapEditor from '@/components/TipTapEditor';
import { apiClient } from '@/lib/api';

export default function NewBlogPage() {
  const router = useRouter();
  const [content, setContent] = useState('');

  const { register, handleSubmit, watch, setValue } = useForm();

  // -------------------------------------
  // ⭐ 1️⃣ Auto-slug generator
  // -------------------------------------
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // ⭐ 2️⃣ When title changes → update slug automatically 
  const handleTitleChange = (e: any) => {
    const title = e.target.value;
    setValue("title", title);

    const currentSlug = watch("slug");
    if (!currentSlug || currentSlug.trim() === "") {
      setValue("slug", generateSlug(title));
    }
  };

  const onSubmit = async (data: any) => {
    await apiClient.createBlog({ ...data, content });
    router.push('/admin/blogs');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Blog</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* ⭐ TITLE */}
        <div>
          <label>Title *</label>
          <input 
            {...register('title')} 
            onChange={handleTitleChange}     // ⭐ 3️⃣ Added here
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
          <textarea {...register('excerpt')} className="input w-full" rows={3} />
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
    If added, Read More will open this link.
  </p>
</div>

{/* SEO SETTINGS */}
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

        <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg">
          Publish Blog
        </button>
      </form>
    </div>
  );
}
