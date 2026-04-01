import React from 'react';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col pointer-events-none">
       {/* Sleek top progression bar animation */}
       <div className="h-1 w-full bg-slate-100 overflow-hidden absolute top-0 left-0">
          <div className="h-full bg-primary-600 w-full origin-left animate-[progressBar_1.5s_ease-in-out_infinite]" />
       </div>
       
       {/* 
         We leave the rest of the screen transparent so the user continues 
         to see the previous layout without immediately wiping the screen to a hard white UI jumper.
       */}
       
       <style dangerouslySetInnerHTML={{ __html: `
         @keyframes progressBar {
           0% { transform: scaleX(0); transform-origin: left; }
           40% { transform: scaleX(0.7); transform-origin: left; }
           50% { transform: scaleX(0.7); transform-origin: right; }
           100% { transform: scaleX(0); transform-origin: right; }
         }
       ` }} />
    </div>
  );
}
