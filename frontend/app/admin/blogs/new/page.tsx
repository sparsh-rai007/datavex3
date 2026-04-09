'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Edit3, 
  Loader2, 
  Save, 
  ArrowLeft, 
  Terminal, 
  User, 
  Briefcase, 
  BarChart, 
  GraduationCap, 
  ChevronDown, 
  Share2, 
  Info, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Globe,
  Settings,
  Eye,
  History,
  Layout,
  Search,
  Zap
} from 'lucide-react';
import TipTapEditor from '@/components/TipTapEditor';
import ShareModal from '@/components/ShareModal';
import { apiClient } from '@/lib/api';
import NewsletterRenderer from '@/components/NewsletterRenderer';

type GeneratorMode = 'manual' | 'keyword' | 'url';

export default function NewBlogPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<GeneratorMode>('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [blogId, setBlogId] = useState<string | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [selectedTone, setSelectedTone] = useState<string>('human');
  const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const TONES = [
    { id: 'human', label: 'Pragmatic Developer', icon: User, desc: 'Conversational & Humanized' },
    { id: 'professional', label: 'Balanced Corporate', icon: Briefcase, desc: 'Official & Technical' },
    { id: 'executive', label: 'C-Suite Insight', icon: BarChart, desc: 'Strategic & High-Level' },
    { id: 'academic', label: 'Neural Scholar', icon: GraduationCap, desc: 'Formal & Detailed' },
  ];

  const currentTone = TONES.find(t => t.id === selectedTone) || TONES[0];

  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewReport, setReviewReport] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      status: 'draft',
      external_url: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      generation_method: 'manual',
      source_reference: ''
    }
  });

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (e: any) => {
    const title = e.target.value;
    setValue("title", title);
    if (!watch("slug")?.trim()) setValue("slug", generateSlug(title));
  };

  const handleGenerateAI = async () => {
    if (!aiQuery.trim()) return;
    setIsGenerating(true);
    try {
      const response = await apiClient.generateBlog(mode as 'keyword' | 'url', aiQuery.trim(), selectedTone);
      const blog = response.blog;
      setBlogId(blog.id);
      setValue('title', blog.title || 'Untitled Publication');
      setValue('slug', blog.slug || generateSlug(blog.title || 'untitled'));
      setContent(blog.content || '');
      triggerReview(blog.content || '');
      setMode('manual');
      setAiQuery('');
    } catch (error: any) {
      console.error('AI Generation Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerReview = async (overrideContent?: string) => {
    const textToReview = overrideContent ?? content;
    if (!textToReview || textToReview.trim().length < 50) return;
    setIsReviewing(true);
    try {
      const result = await apiClient.reviewBlog(textToReview);
      setReviewReport(result);
    } catch (err) {
      console.error("Review failed", err);
    } finally {
      setIsReviewing(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const onSubmit = async (data: any) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (blogId) {
        await apiClient.updateBlog(blogId, { ...data, content });
      } else {
        await apiClient.createBlog({ ...data, content });
      }
      router.push('/admin/blogs');
    } catch (error) {
      alert('Failed to save publication.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-outfit text-slate-900">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/admin/blogs')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="flex flex-col min-w-0 max-w-[500px]">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Layout size={12} />
                <span>Publications</span>
                <span className="text-slate-300">/</span>
                <span className="text-indigo-600">Production Protocol</span>
              </div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight mt-0.5 break-words">
                {watch('title') || 'Synthesizing New Record'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl mr-4">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'editor' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <Edit3 size={14} /> Editor
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'preview' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                <Eye size={14} /> Preview
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
            >
              <Share2 size={18} />
              <span>Export & Share</span>
            </button>

            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>Commit Release</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        {/* Left Column: Synthesis & Editor Area */}
        <div className="space-y-8">
          {activeTab === 'editor' && (
            <>
              {/* Generation Mode Matrix */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  {(['manual', 'keyword', 'url'] as GeneratorMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all relative ${mode === m ? 'text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {m === 'manual' ? <Edit3 size={14} /> : m === 'keyword' ? <Sparkles size={14} /> : <Terminal size={14} />}
                        {m === 'manual' ? 'Manual' : m === 'keyword' ? 'AI Keyword' : 'AI URL'}
                      </span>
                      {mode === m && (
                        <motion.div layoutId="modeBgNew" className="absolute inset-0 bg-slate-900 rounded-xl shadow-lg" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Terminal Section */}
              <AnimatePresence mode="wait">
                {mode !== 'manual' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-slate-900 p-8 rounded-[2rem] relative overflow-hidden group shadow-2xl border border-white/5"
                  >
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                          {mode === 'keyword' ? <Sparkles size={20} /> : <Terminal size={20} />}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white leading-tight">Neural Synthesis Pipeline</h3>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">Autonomous Content Generation Active</p>
                        </div>
                      </div>
                      <div className="flex flex-col xl:flex-row gap-4 items-end">
                        <div className="flex-grow w-full">
                          <label className="block text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest mb-3 ml-1">Objective Command</label>
                          <input
                            type="text"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            placeholder={mode === 'keyword' ? "Enter core keyword..." : "Target authority URL: https://..."}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                          />
                        </div>
                        <button
                          onClick={handleGenerateAI}
                          disabled={isGenerating || !aiQuery.trim()}
                          className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-white hover:text-slate-900 transition-all disabled:opacity-30 h-[56px] min-w-[160px]"
                        >
                          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : 'Synthesize'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

               <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                  <textarea 
                    {...register('title')}
                    onChange={(e) => {
                      handleTitleChange(e);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onInput={(e: any) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    rows={1}
                    placeholder="Enter publication title..."
                    className="w-full text-4xl font-black text-slate-900 placeholder:text-slate-200 outline-none bg-transparent tracking-tight mb-4 resize-none overflow-hidden"
                  />
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-sm text-[11px] font-bold text-slate-500">
                      <Globe size={12} className="text-indigo-500" />
                      <span className="opacity-50">datavex.com/blog/</span>
                      <input 
                        {...register('slug')}
                        className="bg-transparent border-none p-0 focus:ring-0 text-indigo-600 font-bold w-auto min-w-[100px]"
                        placeholder="path-to-article"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="max-h-[700px] overflow-y-auto">
                  <TipTapEditor content={content} onChange={setContent} />
                </div>
              </div>

               {/* Neural SEO Matrix Section */}
              <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-slate-100 shadow-inner">
                    <Search size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Search Engine Matrix</h3>
                    <p className="text-xs text-slate-500 font-medium">SEO Infrastructure Calibration</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meta Title Trace</label>
                      <input 
                        {...register('meta_title')}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                        placeholder="Strategic search heading..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Strategic Keywords</label>
                      <input 
                        {...register('meta_keywords')}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                        placeholder="AI, Neural, Matrix..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meta Narrative</label>
                    <textarea 
                      {...register('meta_description')}
                      className="w-full h-[132px] bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none placeholder:text-slate-300 leading-relaxed shadow-inner"
                      placeholder="Narrative abstract for neural indexing..."
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'preview' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-12 md:p-20 border border-slate-200 shadow-sm min-h-[1000px]"
            >
              <NewsletterRenderer content={content} />
            </motion.div>
          )}
        </div>

        {/* Right Column: Operational Sidebar */}
        <aside className="space-y-8">
          {/* Tone Matrix Selection (Only if AI mode) */}
          {mode !== 'manual' && (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-primary-600/10 group-hover:text-primary-600/20 transition-colors duration-700"><User size={80} /></div>
              <label className="block text-[10px] font-black text-primary-400 uppercase tracking-widest mb-6 ml-2 relative z-10">Voicing Protocol</label>
              <div className="relative z-10">
                <button
                  type="button"
                  onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold flex items-center justify-between hover:bg-white/10 transition-all shadow-inner"
                >
                  <div className="flex items-center gap-3">
                    <currentTone.icon size={16} className="text-primary-400" />
                    <span className="text-sm font-black tracking-tight">{currentTone.label}</span>
                  </div>
                  <ChevronDown size={16} className={isToneDropdownOpen ? 'rotate-180' : ''} />
                </button>
                <AnimatePresence>
                  {isToneDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-slate-950 border border-white/10 rounded-[2rem] overflow-hidden z-50 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    >
                      {TONES.map(t => (
                        <button key={t.id} onClick={() => { setSelectedTone(t.id); setIsToneDropdownOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${selectedTone === t.id ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                          <t.icon size={18} />
                          <div className="text-left">
                             <span className="block text-[11px] font-black uppercase tracking-widest">{t.label}</span>
                             <span className="block text-[9px] font-bold opacity-40 uppercase tracking-widest mt-1">{t.desc}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

           {/* Publication Control Matrix */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xl">
                <Settings size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Publication</h3>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lifecycle Status</label>
                <div className="relative group">
                  <select 
                    {...register('status')}
                    className="w-full bg-slate-50 border border-slate-100 hover:border-indigo-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none cursor-pointer transition-all appearance-none"
                  >
                    <option value="draft">Draft Protocol</option>
                    <option value="published">Release to Matrix</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">External Authority</label>
                <div className="relative group/input">
                  <Terminal size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover/input:text-indigo-500 transition-colors" />
                  <input 
                    {...register('external_url')}
                    className="w-full bg-slate-50 border border-slate-100 hover:border-indigo-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-600 outline-none transition-all shadow-inner"
                    placeholder="https://external-resource.com"
                  />
                </div>
              </div>
            </div>
          </div>

           {/* Neural Audit Hub - Premium Sidebar Integration */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 group-hover:bg-white transition-all duration-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                  <Zap size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Neural Audit</h3>
              </div>
              {isReviewing && <Loader2 size={14} className="animate-spin text-indigo-600" />}
            </div>

            <div className="p-6 space-y-6">
              {reviewReport ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`absolute inset-0 blur-2xl opacity-20 ${reviewReport.overall_score >= 80 ? 'bg-green-400' : 'bg-red-400'}`} />
                      <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 relative bg-white shadow-xl transition-all duration-500 ${reviewReport.overall_score >= 80 ? "border-green-100 text-green-600" : "border-red-100 text-red-600"
                        }`}>
                        <span className="text-2xl font-black leading-none">{reviewReport.overall_score}</span>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 -mt-0.5">Score</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Matrix Compliance</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {reviewReport.overall_score >= 80 ? "High-fidelity content detected." : "Optimization recommended."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'structure_check', label: 'Semantic Flux', icon: BarChart },
                      { key: 'tone_check', label: 'Neural Tone', icon: User },
                      { key: 'hallucination_check', label: 'Fact Fidelity', icon: Info },
                      { key: 'reference_check', label: 'Source Matrix', icon: Share2 },
                    ].map(({ key, label, icon: Icon }) => {
                      const check = reviewReport[key];
                      const isExpanded = expandedAudit === key;
                      const hasIssues = check && !check.passed && check.issues?.length > 0;

                      return (
                        <div key={key} className="space-y-2">
                          <div
                            onClick={() => hasIssues && setExpandedAudit(isExpanded ? null : key)}
                            className={`flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-all ${hasIssues ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={14} className="text-slate-400" />
                              <span className="text-[11px] font-bold text-slate-600">{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {check?.passed ? (
                                <CheckCircle2 size={14} className="text-green-500" />
                              ) : (
                                <>
                                  <AlertTriangle size={14} className="text-amber-500" />
                                  {hasIssues && (
                                    <ChevronDown
                                      size={14}
                                      className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && hasIssues && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
                                  <div className="flex items-center gap-2 text-amber-700">
                                    <AlertTriangle size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Neural Alert</span>
                                  </div>
                                  {check.issues.map((issue: string, i: number) => (
                                    <p key={i} className="text-[10px] text-amber-800 font-medium leading-relaxed">• {issue}</p>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => triggerReview()}
                    disabled={isReviewing}
                    className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[11px] font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={14} /> Re-Audit Matrix
                  </button>
                </>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mx-auto">
                    <Zap size={24} />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">No audit data available.</p>
                  <button
                    onClick={() => triggerReview()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[11px] font-bold hover:bg-indigo-700 transition-all"
                  >
                    Run Neural Audit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Strategic Insight Token */}
          <div className="p-6 bg-indigo-600 rounded-[2rem] text-white relative overflow-hidden shadow-lg shadow-indigo-200 group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                   <Info size={16} className="text-indigo-200" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Strategic Tip</span>
                </div>
                <p className="text-xs font-medium leading-relaxed text-indigo-50">
                   Synthesizing high-authority external URL references within the first narrative block establishes a semantic anchor point, increasing neural indexing trust by 42%.
                </p>
             </div>
          </div>
        </aside>
      </main>
    <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={watch('title') || ''}
        content={content}
        blogUrl={mounted ? `${window.location.origin}/blog/${watch('slug')}` : ''}
      />
    </div>
  );
}
