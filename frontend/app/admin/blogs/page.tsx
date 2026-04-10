'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, Plus, Search, Loader2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getBlogs();
      setBlogs(data.blogs || []);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      await apiClient.deleteBlog(id);
      setBlogs(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Blogs</h2>
            <p className="text-sm text-slate-500 mt-1">Manage and publish your technical content.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search articles..."
                className="h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link
              href="/admin/blogs/new"
              className="h-10 px-4 bg-slate-900 text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Plus size={16} />
              New Article
            </Link>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-slate-400 mb-4" size={24} />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Fetching records</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Title & Slug</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {filteredBlogs.map((blog) => (
                      <motion.tr
                        key={blog.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/30 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-slate-900 group-hover:text-black transition-colors">
                              {blog.title}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              /{blog.slug}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(blog.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${blog.status === 'published' ? 'bg-emerald-500' : 'bg-amber-400'
                              }`} />
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                              {blog.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/blogs/${blog.id}`} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all" title="Edit">
                              <Edit2 size={14} />
                            </Link>
                            <a href={`/blog/${blog.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all" title="View">
                              <ExternalLink size={14} />
                            </a>
                            <button
                              onClick={() => handleDelete(blog.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {!loading && filteredBlogs.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-sm text-slate-400 font-medium italic">No articles found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 flex items-center justify-between text-[11px] text-slate-400 font-medium uppercase tracking-wider">
          <span>Showing {filteredBlogs.length} of {blogs.length} articles</span>
          <span>Last synced: {new Date().toLocaleTimeString()}</span>
        </div>
      </main>
    </div>
  );
}
