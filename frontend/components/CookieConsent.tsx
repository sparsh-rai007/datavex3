'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem('datavex_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('datavex_cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('datavex_cookie_consent', 'false');
    setIsVisible(false);
    
    // Attempt to close the window
    window.close();
    
    // Fallback for modern browsers that block window.close() for security
    window.location.href = 'about:blank';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 md:max-w-2xl md:left-6 md:bottom-6 md:right-auto animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8 flex flex-col gap-4 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <h3 className="font-bold text-slate-900 text-lg mb-2">
            We value your privacy
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-1">
            We use cookies to enhance your browsing experience, serve personalised ads or content, and analyse our traffic. By clicking &quot;Accept All&quot;, you consent to our use of cookies.{' '}
            <Link href="/cookies" className="text-primary-600 font-medium hover:text-primary-700 hover:underline">
              Cookie Policy
            </Link>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2 relative z-10">
          <button
            onClick={handleAccept}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
          >
            Accept All
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
