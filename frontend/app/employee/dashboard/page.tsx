'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import {
  Activity,
  ShieldCheck,
  Binary,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-950 font-sans selection:bg-indigo-600/20 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute -top-1/2 -right-1/4 w-[80%] h-full bg-indigo-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-[80%] h-full bg-indigo-600/5 blur-[120px] rounded-full"></div>
      </div>

      <main className="relative z-10 w-full max-w-5xl px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          

          {/* Massive Editorial Greeting */}
          <h1 className="text-6xl md:text-[6.5vw] font-serif font-medium text-slate-950 leading-[0.9] tracking-tighter mb-12">
            Hello, <span className="italic text-indigo-600 underline decoration-indigo-100 decoration-8 underline-offset-[12px]">{user?.firstName}</span>.
          </h1>

          
            
        
        </motion.div>
      </main>

      {/* Footer Branding */}
      <footer className="absolute bottom-12 left-0 w-full px-12 flex justify-between items-end pointer-events-none opacity-40">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-950/20 uppercase tracking-[0.4em]">Operator ID</span>
          <span className="text-[11px] font-black text-slate-950/40 uppercase tracking-widest">{user?.employeeId}</span>
        </div>
        <div className="text-[9px] font-black text-slate-950/20 uppercase tracking-[0.4em]">
          © 2026 Synthesis Arch.
        </div>
      </footer>
    </div>
  );
}

