'use client';

import { Mail } from 'lucide-react';

export default function TermsClient() {
  return (
    <div className="bg-white font-sans text-slate-800 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        
       <br></br>

        {/* Content Header */}
        <header className="mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
            Terms and Conditions
          </h1>
          <div className="flex items-center gap-4 text-slate-400 text-sm border-t border-slate-100 pt-6">
            <span>DataVex AI India Pvt. Ltd.</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>Last updated May 14, 2026</span>
          </div>
        </header>

        {/* Document Body */}
        <article className="prose prose-slate prose-lg max-w-none">
          
          <p className="leading-relaxed text-slate-600 mb-10">
            Welcome to datavex.in. By accessing or using our website, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use our services.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">1. Intellectual Property Rights</h2>
            <p className="leading-relaxed text-slate-600 mb-4">
              Unless otherwise stated, Datavex and/or its licensors own the intellectual property rights for all material on datavex.in. All intellectual property rights are reserved.
            </p>
            <p className="leading-relaxed text-slate-600 mb-4">You must not:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-4">
              <li>Republish material from datavex.in without prior consent.</li>
              <li>Sell, rent, or sub-license material from the website.</li>
              <li>Reproduce, duplicate, or copy material for commercial purposes.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">2. User Accounts</h2>
            <p className="leading-relaxed text-slate-600">
              If you create an account on our website, you are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. We reserve the right to terminate accounts or remove content at our sole discretion.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">3. Acceptable Use</h2>
            <p className="leading-relaxed text-slate-600 mb-4">
              You agree to use datavex.in only for lawful purposes. You are prohibited from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-4">
              <li>Using the site in any way that causes damage to the website or impairment of availability.</li>
              <li>Engaging in any data mining, data harvesting, or data extracting.</li>
              <li>Using the website to transmit or send unsolicited commercial communications (spam).</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">4. Limitation of Liability</h2>
            <p className="leading-relaxed text-slate-600">
              In no event shall Datavex, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this website. Datavex shall not be held liable for any indirect, consequential, or special liability arising out of your use of our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">5. Privacy Policy</h2>
            <p className="leading-relaxed text-slate-600">
              Your use of the website is also governed by our Privacy Policy. Please review it to understand our practices regarding the collection and use of your personal information.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">6. External Links</h2>
            <p className="leading-relaxed text-slate-600">
              Our website may contain links to third-party websites or services that are not owned or controlled by Datavex. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">7. Governing Law</h2>
            <p className="leading-relaxed text-slate-600">
              These Terms shall be governed by and construed in accordance with the laws of India, and you submit to the non-exclusive jurisdiction of the state and federal courts located in India for the resolution of any disputes.
            </p>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">8. Changes to Terms</h2>
            <p className="leading-relaxed text-slate-600">
              We reserve the right to revise these terms at any time. By using this website, you are expected to review these terms on a regular basis to ensure you understand all conditions governing the use of this website.
            </p>
          </section>

          {/* Clean Contact Block */}
          <div className="bg-slate-950 rounded-3xl p-10 md:p-12 text-center">
            <h3 className="text-2xl font-medium text-white mb-4">
              Contact Us
            </h3>
            <p className="text-slate-400 mb-10 max-w-sm mx-auto text-sm leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <a 
              href="mailto:admin@datavex.in"
              className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-200 transition-colors shadow-lg"
            >
              <Mail className="w-5 h-5" />
              <span>admin@datavex.in</span>
            </a>
          </div>

        </article>
      </div>
    </div>
  );
}
