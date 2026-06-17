'use client';

import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import {
  X,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicWrapper from '../wrapper';
import CustomFooter from '@/components/CustomFooter';
import { apiClient } from '@/lib/api';

const getLogoUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

export default function ProductsClient() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [delistedIds, setDelistedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const visibleProducts = products.filter((p) => !delistedIds.includes(p.id));

  // Fetch visibility settings and products from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visibilityRes, productsRes] = await Promise.all([
          apiClient.getDelistedProducts(),
          apiClient.getProducts()
        ]);

        if (visibilityRes?.success) {
          setDelistedIds(visibilityRes.delisted || []);
        }

        if (productsRes?.success) {
          const mapped = (productsRes.products || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            tagline: p.tagline,
            description: p.description,
            detailedDescription: p.detailed_description,
            metric: p.metric,
            metricLabel: p.metric_label,
            icon: p.icon,
            logoUrl: p.logo_url,
            color: p.color,
            iconColor: p.icon_color,
            iconBg: p.icon_bg,
            glow: p.glow,
            features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]'),
            techStack: Array.isArray(p.tech_stack) ? p.tech_stack : JSON.parse(p.tech_stack || '[]'),
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Failed to load products page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Monitor URL hash for navigation & auto-opening of modals
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '').toLowerCase();
        const found = products.find((p) => p.id === id);
        if (found) {
          setSelectedProduct(found);
        }
      }
    };

    // Run on load
    const timeoutId = setTimeout(handleHash, 200);

    window.addEventListener('hashchange', handleHash);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [delistedIds, products]);

  const closeModal = () => {
    setSelectedProduct(null);
    // remove hash from URL without reloading page
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname + window.location.search);
    }
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <PublicWrapper>
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
          <p className="mt-4 text-sm text-slate-500 font-bold uppercase tracking-wider">Loading Products...</p>
        </div>
      </PublicWrapper>
    );
  }

  const isPageDelisted = delistedIds.includes('global_products_page');

  if (isPageDelisted) {
    return (
      <PublicWrapper>
        <div className="bg-slate-900 text-white font-sans min-h-[90vh] flex items-center justify-center relative overflow-hidden text-left">
          {/* Subtle grid pattern & glows */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-xl mx-auto text-center px-6 relative space-y-8 py-16 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/5 animate-pulse shrink-0"
            >
              <AlertTriangle className="w-10 h-10" />
            </motion.div>

            <div className="space-y-4 text-center">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Products Hub Offline</h1>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                Our dynamic products catalog is temporarily undergoing technical synchronization and scheduling updates. We apologize for any inconvenience.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/"
                className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-50 font-bold rounded-xl transition-all text-sm cursor-pointer"
              >
                Go Home
              </Link>
              <Link
                href="/solutions"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-primary-500/20 cursor-pointer"
              >
                Explore Active Solutions
              </Link>
              <Link
                href="/consultation"
                className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-sm cursor-pointer"
              >
                Schedule Consultation
              </Link>
            </div>
          </div>
        </div>
      </PublicWrapper>
    );
  }

  return (
    <PublicWrapper>
      <div className="bg-slate-50 font-sans selection:bg-primary-200 selection:text-primary-900 min-h-screen">

        {/* Page Hero Section */}
        <section className="relative pt-16 pb-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-200/30 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-200/30 blur-[100px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto px-4 relative text-left">
            <div className="max-w-4xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-8"
              >
                Intelligent Products for <br />
                <span className="text-primary-600">Modern Enterprises</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="text-xl text-slate-600 leading-relaxed max-w-2xl"
              >
                Discover our comprehensive portfolio of specialized SaaS, AI, industrial, and FinTech applications. Click any card to explore full product architectures, tech stacks, and metrics.
              </motion.p>
            </div>
          </div>
        </section>

        {/* 10 Products Grid Section */}
        <section className="max-w-7xl mx-auto px-4 pb-32">
          <div className="flex flex-wrap justify-center gap-8">
            {visibleProducts
              .map((product, i) => {
                const IconComponent = (LucideIcons as any)[product.icon] || LucideIcons.Package;
                return (
                  <motion.article
                    id={`product-card-${i}`}
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    whileHover={{ y: -8 }}
                    onClick={() => setSelectedProduct(product)}
                    className="group p-8 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-2xl hover:shadow-primary-100 transition-all duration-300 flex flex-col items-center text-center w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] cursor-pointer"
                  >
                    <div className="w-full flex flex-col justify-between h-full">
                      <div>
                        {/* Icon or Logo Image */}
                        {product.logoUrl ? (
                          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-8 shadow-md group-hover:scale-110 transition-transform duration-500 mx-auto overflow-hidden">
                            <img src={getLogoUrl(product.logoUrl)} alt={product.name} className="w-full h-full object-cover scale-105" />
                          </div>
                        ) : (
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 mx-auto`}>
                            <IconComponent className="w-7 h-7" />
                          </div>
                        )}

                        {/* Category Label */}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block mb-1">
                          {product.category}
                        </span>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors text-center">
                          {product.name}
                        </h3>

                        {/* Tagline */}
                        <div className="text-xs font-semibold text-primary-600 mb-4 text-center">
                          {product.tagline}
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 mb-8 leading-relaxed text-sm text-center">
                          {product.description}
                        </p>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100/80">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Core Capabilities</div>
                        <ul className="space-y-3 flex flex-col items-start w-fit mx-auto">
                          {product.features.slice(0, 3).map((feature: string) => (
                            <li key={feature} className="flex items-start gap-2.5 text-slate-600 group text-left">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 group-hover:scale-150 transition-transform shrink-0 mt-1.5" />
                              <span className="text-xs">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Call-to-action */}
                        <div className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm hover:gap-3 transition-all pt-4 justify-center">
                          Explore Specifications <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
          </div>
        </section>

        {/* Dynamic Modal Overlay */}
        <AnimatePresence>
          {selectedProduct && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Frosted Glass Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeModal}
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl z-10 border border-slate-100 flex flex-col text-left"
              >
                {/* Modal Header */}
                <div className={`p-6 border-b border-slate-100 flex items-center justify-between relative`}>
                  <div className="flex items-center gap-4">
                    {selectedProduct.logoUrl ? (
                      <div className="w-12 h-12 rounded-xl border border-slate-150 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                        <img src={getLogoUrl(selectedProduct.logoUrl)} alt={selectedProduct.name} className="w-full h-full object-cover scale-105" />
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${selectedProduct.iconBg}`}>
                        {(() => {
                          const SelectedIcon = (LucideIcons as any)[selectedProduct.icon] || LucideIcons.Package;
                          return <SelectedIcon className={`w-6 h-6 ${selectedProduct.iconColor}`} />;
                        })()}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {selectedProduct.category}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight">
                        {selectedProduct.name}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 md:p-8 space-y-6 overflow-y-auto">

                  {/* Detailed Intro */}
                  <div className="space-y-2">
                    <div className="text-sm font-extrabold text-primary-600 uppercase tracking-wider">
                      {selectedProduct.tagline}
                    </div>
                    <p className="text-slate-800 leading-relaxed text-base font-medium">
                      {selectedProduct.detailedDescription}
                    </p>
                  </div>

                  {/* Tech Stack Box */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-150">
                    <div className="flex items-center gap-2 text-slate-500 mb-4">
                      <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Technology Stack & Architecture
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.techStack.map((tech: string) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      Key Features & Specifications
                    </h4>
                    <div className="space-y-3">
                      {selectedProduct.features.map((feature: string, fIndex: number) => (
                        <div key={fIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-600 leading-normal">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer CTAs */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs text-slate-500 font-medium">
                    Deployable on custom cloud environments
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2.5 text-xs text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-200/50 rounded-xl transition-colors"
                    >
                      Close Details
                    </button>
                    <Link
                      href="/consultation"
                      onClick={closeModal}
                      className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-primary-500/10"
                    >
                      Book Free consultation <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>



        <CustomFooter />
      </div>
    </PublicWrapper>
  );
}
