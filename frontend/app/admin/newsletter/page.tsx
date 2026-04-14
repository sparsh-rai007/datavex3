'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit2, Plus, Search, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api';

export default function AdminNewsletterPage() {
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getNewsletters();
      setNewsletters(data.newsletters || []);
    } catch (error) {
      console.error('Failed to load newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm("Trigger today's automation? This will create or update today's draft.")) return;
    setIsGenerating(true);
    try {
      await apiClient.regenerateTodayNewsletter();
      await loadNewsletters();
    } catch (err) {
      console.error('Regeneration failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredNewsletters = newsletters.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               Newsletter Archive
               {isGenerating && <Loader2 className="animate-spin text-indigo-600" size={20} />}
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Manage daily briefings and automation cycles.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search briefings..."
                className="h-10 pl-9 pr-4 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all w-full md:w-64 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="h-10 px-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
              Trigger Today
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synching Records</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Briefing Title</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date Created</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Lifecycle</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">
                    {filteredNewsletters.map((node) => (
                      <motion.tr
                        key={node.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                                {new Date(node.created_at).getDate()}
                             </div>
                             <div className="flex flex-col gap-0.5">
                               <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                                 {node.title || 'Untitled Node'}
                               </span>
                               <span className="text-[10px] font-mono text-slate-400">
                                 UID: {node.id}
                               </span>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                            {new Date(node.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              node.status === 'published' ? 'bg-emerald-100 text-emerald-600' : 
                              node.status === 'sent' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {node.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <Link 
                             href={`/admin/newsletter/${node.id}`} 
                             className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                           >
                             <Edit2 size={12} />
                             Edit
                           </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {!loading && filteredNewsletters.length === 0 && (
                <div className="py-20 text-center">
                   <div className="p-6 bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Search size={24} />
                   </div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching briefings found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
          <span>Archive Nodes: {filteredNewsletters.length} / {newsletters.length}</span>
          <span className="flex items-center gap-2">
             <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
             Last Synched: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </main>
    </div>
  );
}
