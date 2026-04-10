'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Copy, Check, X } from 'lucide-react';
import { useState } from 'react';

interface CredentialsOverlayProps {
  employeeId: string;
  password: string;
  onClose: () => void;
}

export default function CredentialsOverlay({ employeeId, password, onClose }: CredentialsOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(containerRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    
    tl.fromTo(contentRef.current,
      { scale: 0.8, y: 20, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
      '-=0.1'
    );

    return () => {
      tl.kill();
    };
  }, []);

  const copyToClipboard = (text: string, type: 'id' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  const handleClose = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
       duration: 0.3,
       onComplete: onClose
    });
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
    >
      <div 
        ref={contentRef}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-indigo-100"
      >
        <div className="bg-indigo-600 p-8 text-white relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-3xl font-black mb-2 tracking-tight">Credentials Generated</h2>
          <p className="text-indigo-100 font-medium">Important: These details are shown only once.</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Employee ID</label>
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <code className="flex-1 font-mono text-lg font-bold text-slate-900">{employeeId}</code>
              <button 
                onClick={() => copyToClipboard(employeeId, 'id')}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              >
                {copiedId ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Temporary Password</label>
            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <code className="flex-1 font-mono text-lg font-bold text-slate-900">{password}</code>
              <button 
                onClick={() => copyToClipboard(password, 'pass')}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              >
                {copiedPass ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleClose}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-indigo-500/20"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}
