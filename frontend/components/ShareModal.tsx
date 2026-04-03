'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, BookOpen, Loader2, Share2, Hash, ExternalLink } from 'lucide-react';
import { apiClient } from '@/lib/api';

type Tab = 'linkedin' | 'medium';

interface RepurposeData {
  linkedin_post: string;
  medium_title: string;
  medium_subtitle: string;
  tags: string[];
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export default function ShareModal({ isOpen, onClose, title, content }: ShareModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('linkedin');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<RepurposeData | null>(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !data && !isLoading) {
      generateSocialPosts();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setData(null);
      setError('');
      setCopiedField(null);
    }
  }, [isOpen]);

  const generateSocialPosts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await apiClient.repurposeBlog(title, content);
      setData(result);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to generate social posts. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                <Share2 size={18} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Export & Share</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Social Repurpose Engine</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-8 pt-5">
            {([
              { key: 'linkedin' as Tab, label: 'LinkedIn', icon: ExternalLink },
              { key: 'medium' as Tab, label: 'Medium / Dev.to', icon: BookOpen },
            ]).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === key
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Generating social posts...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                <p className="text-red-700 font-bold text-sm">{error}</p>
                <button
                  onClick={generateSocialPosts}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {data && !isLoading && (
              <>
                {/* LinkedIn Tab */}
                {activeTab === 'linkedin' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Ready-to-Post Content
                      </label>
                      <span className="text-[10px] font-bold text-slate-300">
                        {data.linkedin_post.length} chars
                      </span>
                    </div>

                    <div className="relative group">
                      <textarea
                        readOnly
                        value={data.linkedin_post}
                        rows={12}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-slate-700 text-sm font-medium leading-relaxed resize-none focus:outline-none cursor-default"
                      />
                    </div>

                    <button
                      onClick={() => copyToClipboard(data.linkedin_post, 'linkedin')}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#0A66C2] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#004182] transition-all shadow-lg shadow-[#0A66C2]/20 active:scale-[0.98]"
                    >
                      {copiedField === 'linkedin' ? (
                        <><Check size={16} /> Copied to Clipboard</>
                      ) : (
                        <><Copy size={16} /> Copy LinkedIn Post</>
                      )}
                    </button>
                  </div>
                )}

                {/* Medium Tab */}
                {activeTab === 'medium' && (
                  <div className="space-y-6">
                    {/* Medium Title */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          SEO Title
                        </label>
                        <button
                          onClick={() => copyToClipboard(data.medium_title, 'title')}
                          className="text-[10px] font-bold text-primary-600 hover:underline flex items-center gap-1"
                        >
                          {copiedField === 'title' ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                        </button>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-slate-900 font-bold text-lg">
                        {data.medium_title}
                      </div>
                    </div>

                    {/* Medium Subtitle */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Subtitle
                        </label>
                        <button
                          onClick={() => copyToClipboard(data.medium_subtitle, 'subtitle')}
                          className="text-[10px] font-bold text-primary-600 hover:underline flex items-center gap-1"
                        >
                          {copiedField === 'subtitle' ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                        </button>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-3 text-slate-600 font-medium text-sm italic">
                        {data.medium_subtitle}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Tags ({data.tags.length})
                        </label>
                        <button
                          onClick={() => copyToClipboard(data.tags.join(', '), 'tags')}
                          className="text-[10px] font-bold text-primary-600 hover:underline flex items-center gap-1"
                        >
                          {copiedField === 'tags' ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy All</>}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {data.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold tracking-wide"
                          >
                            <Hash size={10} className="text-primary-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 pt-4" />

                    {/* Copy Full Markdown */}
                    <button
                      onClick={() => copyToClipboard(content, 'markdown')}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-primary-600 transition-all shadow-lg active:scale-[0.98]"
                    >
                      {copiedField === 'markdown' ? (
                        <><Check size={16} /> Blog Markdown Copied</>
                      ) : (
                        <><Copy size={16} /> Copy Full Blog Markdown</>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
