'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [revisions, setRevisions] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostForm>();

  useEffect(() => {
    loadPost();
    loadRevisions();
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await apiClient.getPost(postId);
      setPost(data);
      setValue('title', data.title);
      setValue('slug', data.slug);
      setValue('content', data.content || '');
      setValue('excerpt', data.excerpt || '');
      setValue('status', data.status);
      setValue('meta_title', data.meta_title || '');
      setValue('meta_description', data.meta_description || '');
      setValue('meta_keywords', data.meta_keywords || '');
    } catch (error) {
      console.error('Failed to load post:', error);
      alert('Failed to load post');
      router.push('/admin/posts');
    } finally {
      setLoading(false);
    }
  };

  const loadRevisions = async () => {
    try {
      const data = await apiClient.getPostRevisions(postId);
      setRevisions(data);
    } catch (error) {
      console.error('Failed to load revisions:', error);
    }
  };

  const onSubmit = async (data: PostForm) => {
    setSaving(true);
    try {
      await apiClient.updatePost(postId, data);
      router.push('/admin/posts');
    } catch (error: any) {
      console.error('Failed to update post:', error);
      alert(error.response?.data?.error || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                <input
                  {...register('slug', { required: 'Slug is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea
                  {...register('excerpt')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  {...register('content', { required: 'Content is required' })}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select {...register('status')} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input {...register('meta_title')} maxLength={60} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea {...register('meta_description')} rows={3} maxLength={160} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                <input {...register('meta_keywords')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>
{/* Social Publishing Section */}
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-lg font-semibold text-gray-900 mb-4">
    Publish to Social Platforms
  </h2>

  <p className="text-sm text-gray-600 mb-4">
    Choose where you want to publish this post.
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
      const selected: string[] = [];
      if (watch("publish_linkedin")) selected.push("linkedin");
      if (watch("publish_reddit")) selected.push("reddit");
      if (watch("publish_instagram")) selected.push("instagram");

      if (selected.length === 0)
        return alert("Please select at least one platform.");

      const result = await apiClient.publishToSocial({
        platforms: selected,
        title: watch("title"),
        content: watch("content"),
        imageUrl: "",
        url: ""
      });

      alert("Publishing Complete! Check console for details.");
      console.log(result);
    }}
  >
    Publish Now
  </button>
</div>

          {revisions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Revisions ({revisions.length})</h2>
              <div className="space-y-2">
                {revisions.slice(0, 5).map((rev) => (
                  <div key={rev.id} className="text-sm text-gray-600 border-b pb-2">
                    {new Date(rev.created_at).toLocaleString()} by {rev.author_name || 'Unknown'}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
    </div>
  );
}

