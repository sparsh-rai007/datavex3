'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Search,
  Plus,
  Pencil,
  Clock3,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

type NewsletterItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  type?: string;
  generation_method?: string;
  created_at: string;
  updated_at?: string;
};

export default function NewsletterAdminPage() {
  const router = useRouter();

  const [items, setItems] = useState<NewsletterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isForceRunning, setIsForceRunning] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateKeyword, setRegenerateKeyword] = useState('');
  const [search, setSearch] = useState('');

  const loadNewsletters = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getBlogs();
      const blogs = Array.isArray(response?.blogs) ? response.blogs : [];

      const newsletters = blogs
        .filter((b: any) => {
          const type = String(b?.type || '').toLowerCase();
          const generationMethod = String(b?.generation_method || '').toLowerCase();
          const title = String(b?.title || '').toLowerCase();

          return (
            type === 'newsletter' ||
            generationMethod.includes('newsletter') ||
            title.includes('newsletter') ||
            title.includes('briefing')
          );
        })
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      setItems(newsletters);
    } catch (error) {
      console.error('Failed to load newsletters:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNewsletters();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => {
      return (
        item.title?.toLowerCase().includes(q) ||
        item.slug?.toLowerCase().includes(q) ||
        item.status?.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const handleForceRun = async () => {
    setIsForceRunning(true);
    setShowRegenerateModal(false);
    try {
      await apiClient.forceRunNewsletter(regenerateKeyword);
      setRegenerateKeyword('');
      await loadNewsletters();
    } catch (error) {
      console.error('Force run failed:', error);
      alert('Failed to generate newsletter. Check backend logs.');
    } finally {
      setIsForceRunning(false);
    }
  };

  const openEditor = (id: string) => {
    router.push(`/admin/newsletter/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Loading Newsletters...</p>
      </div>
    );
  }

  if (isForceRunning) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-8"
          />
          <h2 className="text-3xl font-black mb-4 tracking-tight">Generating Newsletter</h2>
          <p className="text-slate-400 font-medium leading-relaxed">
            AI is building a new newsletter draft. This can take a few seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto font-outfit min-h-screen bg-slate-50/10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white">
              <Mail size={18} />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Newsletter Control Center</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">All Newsletters</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
            Click any newsletter to edit and publish
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRegenerateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-600 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={14} />
            Generate Newsletter
          </button>

          <button
            onClick={() => router.push('/admin/newsletter/new')}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Plus size={14} />
            New Manual
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] p-4 mb-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search newsletters by title, slug, status..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-3">No newsletters found</h2>
          <p className="text-slate-400 font-medium">Generate one using the button above.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 px-6 py-4 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Created</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => openEditor(item.id)}
              className="w-full text-left grid grid-cols-12 px-6 py-4 border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors"
            >
              <div className="col-span-5 pr-4">
                <p className="text-sm font-black text-slate-900 line-clamp-1">{item.title || 'Untitled Newsletter'}</p>
                <p className="text-[11px] font-bold text-slate-400 mt-1 line-clamp-1">/{item.slug}</p>
              </div>
              <div className="col-span-2">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="col-span-3 flex items-center gap-2 text-sm font-bold text-slate-500">
                <Clock3 size={14} className="text-slate-300" />
                {new Date(item.created_at).toLocaleString()}
              </div>
              <div className="col-span-2 flex justify-end items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-[10px]">
                <Pencil size={14} />
                Edit
              </div>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showRegenerateModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowRegenerateModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-lg w-full relative z-[120] shadow-2xl"
            >
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Generate New Newsletter?</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-6">
                This will create a new newsletter draft. Existing newsletters are not deleted.
              </p>

              <div className="mb-6">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Optional Keyword
                </label>
                <input
                  type="text"
                  value={regenerateKeyword}
                  onChange={(e) => setRegenerateKeyword(e.target.value)}
                  placeholder="e.g. MCP servers, vector databases, AI agents"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
                />
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                  Leave empty for automatic trend mode.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleForceRun}
                  className="w-full py-4 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Confirm Generation
                </button>
                <button
                  onClick={() => setShowRegenerateModal(false)}
                  className="w-full py-4 bg-slate-50 text-slate-500 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
