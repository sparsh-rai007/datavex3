import { motion } from 'framer-motion';
import { Terminal, Shield, Zap, Mail } from 'lucide-react';
import Link from 'next/link';

export default function AdminBlogArchivePage() {
  return (
    <div className="min-h-screen bg-slate-50/20 flex flex-col items-center justify-center font-outfit p-10">
      <div className="max-w-2xl text-center space-y-12 bg-white p-20 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
          
          <div className="w-24 h-24 bg-slate-950 rounded-[2.5rem] flex items-center justify-center text-primary-500 mx-auto shadow-2xl shadow-primary-500/20">
              <Terminal size={48} />
          </div>

          <div className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Administrative Restraint</span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  Archive <span className="text-primary-600">Re-indexing</span>
              </h1>
              <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-lg mx-auto">
                  The standard legacy blog system is currently undergoing deep structural architectural re-indexing. Administrative authority has been transitioned to the specialized Morning Dashboard.
              </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4 transition-all hover:bg-white hover:shadow-xl group">
                  <Shield size={32} className="text-primary-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Indexing</span>
              </div>
              <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-4 transition-all hover:bg-white hover:shadow-xl group">
                  <Zap size={32} className="text-primary-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neural Synthesis</span>
              </div>
          </div>

          <div className="pt-8">
              <Link 
                  href="/admin/newsletter"
                  className="px-14 py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-primary-600 transition-all shadow-2xl active:scale-95 inline-flex items-center gap-4 group"
              >
                  <Mail size={18} className="group-hover:rotate-12 transition-transform" />
                  Manage Morning Briefings
              </Link>
          </div>

          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] pt-12 border-t border-slate-50">
            System Authorized Access — DATAVEX Core v1.4
          </p>

      </div>
    </div>
  );
}
