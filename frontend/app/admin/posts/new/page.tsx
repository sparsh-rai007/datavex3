'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';

interface PostForm {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  publish_linkedin?: boolean;
  publish_reddit?: boolean;
  publish_instagram?: boolean;
}

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [seoSuggestions, setSeoSuggestions] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostForm>({
    defaultValues: {
      status: 'draft',
      meta_keywords: '',
    },
  });

  const title = watch('title');
  const content = watch('content');

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue('title', newTitle);
    if (!watch('slug')) {
      setValue('slug', generateSlug(newTitle));
    }
  };

  const getContentSuggestions = async () => {
    if (!content) return;
    try {
      const suggestions = await apiClient.getContentSuggestions({
        content,
        title: title || undefined,
        type: 'blog',
      });
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  };

  const getSEOSuggestions = async () => {
    try {
      const suggestions = await apiClient.getSEOSuggestions({
        title: title || undefined,
        content: content || undefined,
        metaDescription: watch('meta_description') || undefined,
      });
      setSeoSuggestions(suggestions);
      if (suggestions.metaTitle) setValue('meta_title', suggestions.metaTitle);
      if (suggestions.metaDescription) setValue('meta_description', suggestions.metaDescription);
      if (suggestions.keywords.length > 0) {
        setValue('meta_keywords', suggestions.keywords.join(', '));
      }
    } catch (error) {
      console.error('Failed to get SEO suggestions:', error);
    }
  };

  const onSubmit = async (data: PostForm) => {
    setLoading(true);
    try {
      await apiClient.createPost(data);
      router.push('/admin/posts');
    } catch (error: any) {
      console.error('Failed to create post:', error);
      alert(error.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  {...register('slug', {
                    required: 'Slug is required',
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message: 'Invalid slug format (use lowercase letters, numbers, and hyphens)',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  {...register('excerpt')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  {...register('content', { required: 'Content is required' })}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
                <button
                  type="button"
                  onClick={getContentSuggestions}
                  className="mt-2 px-4 py-2 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                >
                  Get AI Content Suggestions
                </button>
                {aiSuggestions && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">AI Suggestions:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {aiSuggestions.suggestions?.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
          {/* Social Publishing Section */}
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">
    Publish to Social Platforms
  </h2>

  <p className="text-sm text-gray-600 mb-4">
    Choose where you want to publish this post after creation.
  </p>

  <div className="flex flex-col gap-3">
    <label className="flex items-center gap-2">
      <input type="checkbox" {...register("publish_linkedin")} />
      <span>LinkedIn</span>
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" {...register("publish_reddit")} />
      <span>Reddit</span>
    </label>

    <label className="flex items-center gap-2">
      <input type="checkbox" {...register("publish_instagram")} />
      <span>Instagram (image only)</span>
    </label>
  </div>

  <button
    type="button"
    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
    onClick={async () => {
      const sel: string[] = [];
      if (watch("publish_linkedin")) sel.push("linkedin");
      if (watch("publish_reddit")) sel.push("reddit");
      if (watch("publish_instagram")) sel.push("instagram");

      if (sel.length === 0) {
        alert("Select at least one platform.");
        return;
      }

      const result = await apiClient.publishToSocial({
        platforms: sel,
        title: watch("title"),
        content: watch("content"),
        imageUrl: "", // Add upload support later
        url: ""
      });

      alert("Publishing complete! Check console for results.");
      console.log(result);
    }}
  >
    Publish Now
  </button>
</div>

          {/* SEO Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
              <button
                type="button"
                onClick={getSEOSuggestions}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Get AI SEO Suggestions
              </button>
            </div>

            {seoSuggestions && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-semibold text-green-800 mb-2">
                  SEO Score: {seoSuggestions.seoScore}/100
                </p>
                {seoSuggestions.suggestions?.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                    {seoSuggestions.suggestions.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  {...register('meta_title')}
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Recommended: 50-60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  {...register('meta_description')}
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Recommended: 150-160 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Keywords (comma-separated)
                </label>
                <input
                  {...register('meta_keywords')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
    </div>
  );
}

