'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, Layers, Search, MoreVertical } from 'lucide-react';

interface RelatedResult {
  title: string;
  description: string;
  url: string;
}

export default function RelatedReferences({ topic }: { topic: string }) {
  const [results, setResults] = useState<RelatedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch(`/api/related?q=${encodeURIComponent(topic)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch related", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRelated();
  }, [topic]);

  if (loading) {
    return (
      <div className="mt-8 p-5 bg-white border border-slate-100 rounded-[24px] animate-pulse">
         <div className="h-4 w-1/3 bg-slate-100 rounded-full mb-6"></div>
         <div className="space-y-4">
           {[1,2,3].map(i => (
             <div key={i} className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-slate-100 rounded-full"></div>
                  <div className="h-4 w-2/3 bg-slate-100 rounded-full"></div>
                </div>
                <div className="w-16 h-16 rounded-xl bg-slate-100"></div>
             </div>
           ))}
         </div>
      </div>
    );
  }

  if (results.length === 0) return null;

  const displayResults = showAll ? results : results.slice(0, 3);

  return (
    <div className="mt-8 bg-white rounded-[24px] overflow-hidden text-slate-900 border border-slate-100 shadow-xl font-outfit">
      
      {/* Header */}
      <div className="p-5 flex flex-col gap-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="flex -space-x-2">
               {results.slice(0, 3).map((res, i) => {
                 let hostname = '';
                 try { hostname = new URL(res.url).hostname.replace('www.', ''); } catch (e) {}
                 return (
                   <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shrink-0 z-[1] shadow-sm">
                     <img src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`} className="w-3.5 h-3.5" alt="" />
                   </div>
                 );
               })}
             </div>
             <span className="text-sm font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-primary-600 transition-colors">Related Resources</span>
          </div>
          <button className="text-slate-300 hover:text-slate-500 transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="flex flex-col">
        {displayResults.map((res: any, idx: number) => {
          let hostname = 'external-source.com';
          try { hostname = new URL(res.url).hostname.replace('www.', ''); } catch (e) {}

          return (
            <a key={idx} href={res.url} target="_blank" rel="noopener noreferrer" className="block group p-5 border-b border-slate-100 hover:bg-slate-50 transition-all">
              <div className="flex gap-4">
                <div className="flex-1">
                  <h4 className="text-[17px] font-bold text-slate-900 group-hover:text-primary-600 leading-snug mb-2 line-clamp-2 transition-colors">{res.title}</h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-3 mb-3">{res.content || res.description || "External source containing relevant topical data."}</p>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0 shadow-sm border border-slate-200">
                      <img src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`} className="w-2.5 h-2.5" alt="" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{hostname}</span>
                  </div>
                </div>

                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-50 shadow-sm">
                  <img 
                    src={`https://image.thum.io/get/width/100/crop/100/noanimate/${res.url}`} 
                    alt="Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                       e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Footer Button */}
      {!showAll && results.length > 3 && (
        <div className="p-4 px-5 bg-slate-50/50 border-t border-slate-100">
           <button 
             onClick={(e) => { e.preventDefault(); setShowAll(true); }}
             className="w-full py-2.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold transition-all shadow-sm"
           >
             Show all results
           </button>
        </div>
      )}
    </div>
  );
}
