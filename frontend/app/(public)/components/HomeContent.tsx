'use client';

import Link from 'next/link';
import PublicWrapper from '../wrapper';
import RecentArticles from './RecentArticles';
import SolutionsOverview from './SolutionsOverview';
import CustomFooter from '@/components/CustomFooter';
import TechnologyStack from './TechnologyStack';

export default function HomeContent() {
  return (
    <PublicWrapper>


      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white min-h-[90vh] flex items-center pt-28 pb-20 border-b border-gray-100">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
        
        {/* Glowing blur effects */}
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column (Text & CTAs) */}
            <div className="lg:col-span-7 text-left space-y-8">
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Driving business growth with{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
                  intelligent systems
                </span>{" "}
                that ship.
              </h1>
              
              <h2 className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
                DataVex blends AI strategy, data science, cloud engineering, and product development to help organizations move from possibility to measurable impact.
              </h2>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all duration-200 hover:-translate-y-0.5 text-lg"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/solutions"
                  className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 hover:-translate-y-0.5 text-lg shadow-sm"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Column (Hero Image) */}
            <div className="lg:col-span-5 relative w-full flex justify-center lg:justify-end">
              <div className="relative rounded-3xl p-2 bg-gradient-to-tr from-blue-100 via-indigo-100 to-cyan-100 shadow-2xl w-full max-w-[480px]">
                <div className="rounded-2xl overflow-hidden bg-slate-50 border border-white/50">
                  <img
                    src="/hero.png"
                    alt="Driving business growth with intelligent systems"
                    className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <SolutionsOverview />

      <TechnologyStack />

      <RecentArticles />

      <CustomFooter />
    </PublicWrapper>
  );
}
