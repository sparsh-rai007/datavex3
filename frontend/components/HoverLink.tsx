'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Globe } from 'lucide-react';

export default function HoverLink({ href, title, children }: any) {
  let hostname = '';
  try { 
    hostname = new URL(href).hostname.replace('www.', ''); 
  } catch(e) {
    hostname = 'external-source.com';
  }

  const [isHovered, setIsHovered] = useState(false);
  const [livePreview, setLivePreview] = useState<{description?: string, image?: string, loaded: boolean}>({ loaded: false });

  // Dynamically fetch actual content from the remote site upon hover-intent
  useEffect(() => {
    if (isHovered && !livePreview.loaded) {
      setLivePreview(p => ({ ...p, loaded: true })); // Only fetch once!
      fetch(`/api/preview?url=${encodeURIComponent(href)}`)
        .then(r => r.json())
        .then(data => {
           if (data.description) {
             setLivePreview({ description: data.description, image: data.image, loaded: true });
           }
        })
        .catch(e => console.error("Neural link resolution deferred", e));
    }
  }, [isHovered, href, livePreview.loaded]);

  return (
    <div 
      className="relative inline-block group mx-1.5 align-middle z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a 
        href={href}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wide hover:bg-slate-200 hover:text-slate-900 transition-all border border-slate-200/80 shadow-sm cursor-pointer"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
           <img src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`} className="w-2.5 h-2.5" alt="" />
        </div>
        {hostname}
      </a>

      {/* Predictive Popover Card */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] w-[340px] translate-y-2 group-hover:translate-y-0 pointer-events-none">
        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50 backdrop-blur-xl">
           <h4 className="text-white text-sm font-bold leading-relaxed mb-3 line-clamp-2">
             {children}
           </h4>
           
           <p className="text-slate-400 text-xs mb-5 line-clamp-4 leading-relaxed font-medium">
             {livePreview.description || title || "External intelligence node designated for neural cross-referencing. Gathering target material context..."}
           </p>

           <div className="flex items-center justify-between pt-4 border-t border-white/10">
             <div className="flex items-center gap-3">
               <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                 {livePreview.image ? (
                   <img src={livePreview.image} className="w-full h-full object-cover" alt="" />
                 ) : (
                   <img src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`} className="w-3.5 h-3.5" alt="" />
                 )}
               </div>
               <span className="text-[10px] text-slate-300 font-black tracking-widest uppercase truncate max-w-[150px]">{hostname}</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-[9px] font-black text-white/50 tracking-widest uppercase shrink-0">
               <span>Expand</span>
               <ExternalLink size={10} className="text-primary-400" />
             </div>
           </div>
        </div>
        {/* Indicator Triangle */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[6px] border-r-[6px] border-l-transparent border-r-transparent border-t-[6px] border-t-[#1A1A1A]" />
      </div>
    </div>
  );
}
