'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function AdminNewsletterPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    apiClient.getBlogs().then((data) => setBlogs(data.blogs));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Newsletter</h1>
        <Link href="/admin/newsletter/new" className="px-4 py-2 bg-primary-600 text-white rounded-lg">
          Create Newsletter
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Source</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {blogs.map((blog: any) => (
              <tr key={blog.id} className="border-b">
                <td className="px-6 py-4">{blog.title}</td>
                <td className="px-6 py-4">{blog.status}</td>
                <td className="px-6 py-4">
                  {blog.generation_method === 'ai_keyword' && (
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">AI Keyword</span>
                  )}
                  {blog.generation_method === 'ai_url' && (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">AI URL</span>
                  )}
                  {(!blog.generation_method || blog.generation_method === 'manual') && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Manual</span>
                  )}
                </td>
                <td className="px-6 py-4">{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/newsletter/${blog.id}`} className="text-primary-600 mr-3">
                    Edit
                  </Link>
                  <button
                    onClick={async () => {
                      await apiClient.deleteBlog(blog.id);
                      window.location.reload();
                    }}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
