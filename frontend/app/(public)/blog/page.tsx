import PublicWrapper from '../wrapper';
import { motion } from 'framer-motion';
import { Terminal, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Blog Protocol — Under Development',
  description: 'The standard blog archive is currently under structural maintenance. View the Neural Synthesis Archive for current briefing releases.',
};

export default function BlogUnderDevelopmentPage() {
  return (
    <PublicWrapper>
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-outfit p-6">
        <div className="max-w-xl text-center space-y-8">
            
            <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center text-primary-500 mx-auto shadow-2xl shadow-primary-500/10">
                <Terminal size={40} />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Protocol Restricted</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
                    Archive <span className="text-primary-600">Maintenance</span>
                </h1>
                <p className="text-slate-400 font-medium text-lg leading-relaxed">
                    The traditional blog matrix is currently undergoing architectural re-indexing. All high-authority technical briefings have been transitioned to the specialized newsletter archive.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center gap-3">
                    <Shield size={24} className="text-primary-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Indexing</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center gap-3">
                    <Zap size={24} className="text-primary-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neural Sync</span>
                </div>
            </div>

            <div className="pt-8">
                <Link 
                    href="/newsletter"
                    className="px-12 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-primary-600 transition-all shadow-2xl active:scale-95 inline-flex items-center gap-3"
                >
                    Access Neural Archive
                </Link>
            </div>

        </div>
      </div>
    </PublicWrapper>
  );
}
