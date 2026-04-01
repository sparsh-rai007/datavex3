export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 font-outfit">
      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Skeleton */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4 animate-pulse">
            <div className="w-32 h-8 bg-slate-200 rounded-full mx-auto" />
            <div className="w-3/4 h-12 bg-slate-200 rounded-full mx-auto" />
            <div className="w-1/2 h-6 bg-slate-200 rounded-full mx-auto" />
          </div>

          {/* Featured Post Skeleton */}
          <div className="rounded-[3rem] bg-white border border-slate-100 p-8 md:p-12 shadow-xl shadow-slate-200/20 mb-20 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="w-full h-80 bg-slate-200 rounded-[2rem]" />
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-24 h-8 bg-slate-200 rounded-full" />
                  <div className="w-24 h-8 bg-slate-200 rounded-full" />
                </div>
                <div className="w-full h-12 bg-slate-200 rounded-full" />
                <div className="w-5/6 h-6 bg-slate-200 rounded-full" />
                <div className="w-4/5 h-6 bg-slate-200 rounded-full" />
                <div className="w-32 h-12 bg-slate-200 rounded-full mt-8" />
              </div>
            </div>
          </div>

          {/* Filter Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-pulse">
            <div className="flex gap-3 overflow-hidden">
              {[1,2,3,4].map(i => <div key={i} className="w-24 h-10 bg-slate-200 rounded-2xl shrink-0" />)}
            </div>
            <div className="w-64 h-12 bg-slate-200 rounded-2xl" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/20 animate-pulse">
                 <div className="w-full h-48 bg-slate-200 rounded-[2rem] mb-6" />
                 <div className="space-y-4">
                   <div className="w-20 h-6 bg-slate-200 rounded-full" />
                   <div className="w-full h-8 bg-slate-200 rounded-full" />
                   <div className="w-4/5 h-8 bg-slate-200 rounded-full" />
                   <div className="w-full h-20 bg-slate-200 rounded-2xl mt-4" />
                 </div>
               </div>
             ))}
          </div>

        </div>
      </main>
    </div>
  );
}
