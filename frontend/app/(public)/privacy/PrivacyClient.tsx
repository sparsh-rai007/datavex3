'use client';

import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';

export default function PrivacyClient() {
  return (
    <div className="bg-white font-sans text-slate-800 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        
       <br></br>

        {/* Content Header */}
        <header className="mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
            Privacy Policy
          </h1>
          <div className="flex items-center gap-4 text-slate-400 text-sm border-t border-slate-100 pt-6">
            <span>DataVex AI India Pvt. Ltd.</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>Last updated February 2026</span>
          </div>
        </header>

        {/* Document Body */}
        <article className="prose prose-slate prose-lg max-w-none">
          
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">1. Introduction</h2>
            <p className="leading-relaxed text-slate-600">
              Datavex AI Pvt. Ltd. (“Datavex”, “we”, “our”, or “us”) respects your privacy. 
              This Privacy Policy explains how we handle information when you visit our website. 
              Our website is intended as a static informational page and does not actively collect 
              personal data from visitors.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">2. Information We Do Not Collect</h2>
            <p className="leading-relaxed text-slate-600 mb-6">
              To ensure your privacy, we have designed our website so that we do not require any direct interaction involving your personal identity. Specifically:
            </p>
            <ul className="space-y-4 text-slate-600 list-none p-0">
              <li className="flex gap-3">
                <span className="text-slate-300 font-serif italic text-xl leading-none">01</span>
                <span>We do not require registration or user accounts.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-300 font-serif italic text-xl leading-none">02</span>
                <span>We do not provide contact or lead-generation forms on this page.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-300 font-serif italic text-xl leading-none">03</span>
                <span>We do not store or process any user-submitted personal data.</span>
              </li>
            </ul>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">3. Automatically Collected Data</h2>
            <p className="leading-relaxed text-slate-600 mb-6">
              Like most standard websites, basic technical information may be automatically processed by your 
              browser or hosting infrastructure to maintain site health and security:
            </p>
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex flex-wrap gap-8 mb-6">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Network</div>
                <div className="text-slate-700 text-sm font-medium italic">IP Address</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Software</div>
                <div className="text-slate-700 text-sm font-medium italic">Browser Type</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Hardware</div>
                <div className="text-slate-700 text-sm font-medium italic">Device Info</div>
              </div>
            </div>
            <p className="text-slate-500 text-sm italic">
              * Note: We do not use this data to personally identify visitors. It serves strictly as a tool for technical diagnostics and monitoring unauthorized access.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-16 border-y border-slate-100 mb-16">
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">4. Cookies & Tracking</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                We do not use tracking cookies, advertising trackers, or behavioral analytics. Any session cookies are strictly functional and temporary.
              </p>
            </section>
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">5. Data Security</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Because we do not store personal data through this platform, the risk of data exposure is virtually non-existent. We rely on enterprise-grade hosting security.
              </p>
            </section>
          </div>

          <section className="mb-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">6. Children’s Privacy</h2>
            <p className="leading-relaxed text-slate-600">
              Our services and website are not directed toward children under 18. We do not knowingly 
              collect information from minors, nor do we provide features intended for their use.
            </p>
          </section>

          {/* Clean Contact Block */}
          <div className="bg-slate-950 rounded-3xl p-10 md:p-12 text-center">
            <h3 className="text-2xl font-medium text-white mb-4">
              Questions regarding privacy?
            </h3>
            <p className="text-slate-400 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
              If you have any concerns or need further clarification, our compliance team is available.
            </p>
            <a 
              href="mailto:solutions@datavex.ai"
              className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-200 transition-colors shadow-lg"
            >
              <Mail className="w-5 h-5" />
              <span>Contact Us</span>
            </a>
          </div>

        </article>
      </div>
    </div>
  );
}
