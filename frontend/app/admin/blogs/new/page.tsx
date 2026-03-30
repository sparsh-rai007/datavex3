'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import TipTapEditor from '@/components/TipTapEditor';
import { apiClient } from '@/lib/api';

type GeneratorMode = 'manual' | 'keyword' | 'url';

export default function NewBlogPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<GeneratorMode>('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiQuery, setAiQuery] = useState('');

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      status: 'draft',
      external_url: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    }
  });

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

  const handleGenerateAI = async () => {
    if (!aiQuery.trim()) {
      alert(mode === 'keyword' ? 'Please enter a keyword/topic' : 'Please enter a URL');
      return;
    }

    setIsGenerating(true);

    try {
      const type = mode as 'keyword' | 'url';
      const response = await apiClient.generateBlog(type, aiQuery.trim());
      const blog = response.blog;

      // Populate form with generated content
      setValue('title', blog.title || '');
      setValue('slug', blog.slug || generateSlug(blog.title || ''));
      setValue('excerpt', '');
      setContent(blog.content || '');

      // Switch to manual mode so user can review/edit
      setMode('manual');
      setAiQuery('');

      // Redirect to edit page for the saved draft
      router.push(`/admin/blogs/${blog.id}`);
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      const message =
        error?.response?.data?.error ||
        'Something went wrong during generation. Please try again.';
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await apiClient.createBlog({ ...data, content });
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save blog. Check console for details.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Blog</h1>
      </div>

      {/* TABS / SWITCHER */}
      <div className="flex gap-4 mb-8 border-b pb-4">
        <button
          onClick={() => setMode('manual')}
          className={`pb-2 px-1 transition-all ${mode === 'manual' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setMode('keyword')}
          className={`pb-2 px-1 transition-all ${mode === 'keyword' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}
        >
          Generate from Keyword
        </button>
        <button
          onClick={() => setMode('url')}
          className={`pb-2 px-1 transition-all ${mode === 'url' ? 'border-b-2 border-primary-600 text-primary-600 font-medium' : 'text-gray-500'}`}
        >
          Generate from URL
        </button>
      </div>

      {/* AI GENERATOR INTERFACE */}
      {mode !== 'manual' && (
        <div className="bg-primary-50 p-6 rounded-xl border border-primary-100 mb-8 relative overflow-hidden">
          {isGenerating && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-primary-800 font-medium font-outfit">AI is crafting your draft...</p>
            </div>
          )}
          
          <h2 className="text-lg font-semibold mb-2 text-primary-900">
            {mode === 'keyword' ? '✨ Generate from Topic' : '🔗 Generate from URL'}
          </h2>
          <p className="text-sm text-primary-700 mb-4">
            {mode === 'keyword' 
              ? 'Enter a topic like "The future of AI automation" to generate a detailed blog draft.' 
              : 'Paste an article URL to summarize and re-draft it in your own style.'}
          </p>

          <div className="flex gap-3">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder={mode === 'keyword' ? "Enter topic or keywords..." : "Paste URL here (e.g. https://...)"}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 inline-flex items-center"
            >
              Generate AI Draft
            </button>
          </div>
        </div>
      )}

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 transition-opacity ${isGenerating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        <div className="grid grid-cols-2 gap-6">
          {/* TITLE */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input 
              {...register('title')} 
              onChange={handleTitleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
            />
          </div>

          {/* SLUG */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium mb-1">Slug *</label>
            <input 
              {...register('slug')} 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
            />
          </div>
        </div>

        {/* EXCERPT */}
        <div>
          <label className="block text-sm font-medium mb-1">Excerpt (Short Summary)</label>
          <textarea 
            {...register('excerpt')} 
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
            rows={2} 
          />
        </div>

        {/* CONTENT */}
        <div>
          <label className="block text-sm font-medium mb-2">Content *</label>
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* STATUS */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select {...register('status')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* EXTERNAL URL */}
          <div>
            <label className="block text-sm font-medium mb-1">External URL (Optional)</label>
            <input
              {...register("external_url")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* SEO SETTINGS */}
        <div className="bg-gray-50 p-6 rounded-xl border space-y-4">
          <h2 className="text-lg font-semibold">SEO Settings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Meta Title</label>
              <input
                {...register("meta_title")}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                maxLength={60}
                placeholder="Meta title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meta Keywords</label>
              <input
                {...register("meta_keywords")}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="AI, automation, ..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Meta Description</label>
            <textarea
              {...register("meta_description")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              maxLength={160}
              rows={2}
              placeholder="Meta description..."
            />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button 
            type="submit" 
            className="px-8 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-primary-500/30"
          >
            Create Blog
          </button>
        </div>
      </form>
    </div>
  );
}
