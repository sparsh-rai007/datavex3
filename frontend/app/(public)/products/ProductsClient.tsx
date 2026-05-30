'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  CreditCard,
  HeartPulse,
  Compass,
  Scale,
  CheckSquare,
  Mic,
  Users,
  Calculator,
  Anchor,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Gauge,
  TrendingUp,
  ArrowUpRight,
  HelpCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicWrapper from '../wrapper';
import CustomFooter from '@/components/CustomFooter';
import { apiClient } from '@/lib/api';

const products = [
  {
    id: 'vexcad',
    name: 'VexCAD',
    category: 'Engineering & Design',
    tagline: '2D to 3D CAD draft conversion engine',
    description: 'Convert architectural drawings, engineering drafts, and 2D blueprints into production-ready 3D CAD files instantly.',
    detailedDescription: 'VexCAD is a cutting-edge spatial computing assistant that leverages deep learning to translate 2D vector layouts and structural line drawings into detailed 3D volumetric assets. Engineered for developers, civil architects, and manufacturing plants to compress modeling lifecycles.',
    metric: '85%',
    metricLabel: 'Reduction in CAD Modeling Time',
    icon: Layers,
    color: 'from-blue-500 via-blue-600 to-indigo-700',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-100',
    glow: 'shadow-blue-500/10 hover:shadow-blue-500/20 border-blue-100',
    features: [
      'Multi-format vector ingestion (DWG, DXF, PDF, SVG)',
      'Automated polygon mesh rendering and topological checks',
      'Precision scale and volumetric margin adjustments',
      'One-click exporting to STL, OBJ, STEP, and IGES file types'
    ],
    techStack: ['Three.js', 'WebGL', 'C++', 'PyTorch']
  },
  {
    id: 'credivex',
    name: 'CrediVex',
    category: 'FinTech & Security',
    tagline: 'Credit Card Information System',
    description: 'Comprehensive banking intelligence suite for card transaction audits, credit scoring, and secure ledgering.',
    detailedDescription: 'CrediVex is an enterprise core credit card information registry and balance tracking system. Providing bank-level encryption alongside transaction audit trails, real-time interest calculation pipelines, and multi-tenant ledger synchronization.',
    metric: '99.999%',
    metricLabel: 'Transaction Ledger Accuracy',
    icon: CreditCard,
    color: 'from-cyan-500 via-cyan-600 to-blue-700',
    iconColor: 'text-cyan-600',
    iconBg: 'bg-cyan-50 border-cyan-100',
    glow: 'shadow-cyan-500/10 hover:shadow-cyan-500/20 border-cyan-100',
    features: [
      'PCI-DSS compliance grade audit trails and vault databases',
      'Real-time spending pattern mapping and credit scoring analytics',
      'Dunning alert pipelines & automated dispute reconciliation',
      'High-throughput banking API connections & batch processors'
    ],
    techStack: ['Node.js', 'PostgreSQL', 'Redis', 'Kubernetes']
  },
  {
    id: 'cureconnect',
    name: 'CureConnect',
    category: 'Healthcare & Logistics',
    tagline: 'Medical Tourism Platform',
    description: 'Global medical matchmaking, secure records translation, travel logistics, and clinic booking hub.',
    detailedDescription: 'CureConnect acts as a digital bridge between international medical facilities and global patients. The system coordinates treatment quotations, electronic health records (EHR) exchanges, flight and hotel reservations, and post-op rehabilitation routines.',
    metric: '42%',
    metricLabel: 'Procedure Cost Deflection',
    icon: HeartPulse,
    color: 'from-emerald-500 via-teal-600 to-emerald-700',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-100',
    glow: 'shadow-emerald-500/10 hover:shadow-emerald-500/20 border-emerald-100',
    features: [
      'Verified global directories of clinics, hospitals, and surgeons',
      'HIPAA-compliant encrypted medical history and EHR portals',
      'Integrated logistics hub for hotel, transport, and flights scheduling',
      'Real-time translation and multi-currency billing engines'
    ],
    techStack: ['Next.js', 'FastAPI', 'HIPAA Cloud API', 'Twilio']
  },
  {
    id: 'mysticroutes',
    name: 'MysticRoutes',
    category: 'Tourism & Travel',
    tagline: 'Spiritual & Sacred Tourism Platform',
    description: 'Discover, plan, and book seamless spiritual pilgrim circuits, local guide packages, and wellness retreats.',
    detailedDescription: 'MysticRoutes brings structure, safety, and deep contextual guidance to pilgrim travelers. Meticulously cataloging sacred places of worship, booking temple-managed accommodations, hiring certified guides, and predicting crowd flows.',
    metric: '15k+',
    metricLabel: 'Sacred Locations Cataloged',
    icon: Compass,
    color: 'from-amber-500 via-amber-600 to-orange-700',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-100',
    glow: 'shadow-amber-500/10 hover:shadow-amber-500/20 border-amber-100',
    features: [
      'Customized spiritual itinerary planners with guide assignments',
      'Temple and ashram booking directories with direct ledger sync',
      'Real-time safety, queue capacity, and local festival alerts',
      'Offline maps, language guides, and emergency travel assistance'
    ],
    techStack: ['GraphQL', 'PostgreSQL', 'Google Maps API', 'React Native']
  },
  {
    id: 'lexos',
    name: 'LexOS',
    category: 'Enterprise & Compliance',
    tagline: 'Legal OS for Organisations',
    description: 'Autonomous contract audits, dynamic corporate governance playbooks, and litigation milestone trackers.',
    detailedDescription: 'LexOS is a comprehensive digital legal framework that empowers operations teams. Automatically scanning corporate paperwork, flagging unfavorable contractual clauses, drafting templates, and establishing clear audit trails for board regulatory reviews.',
    metric: '94%',
    metricLabel: 'Reduction in Legal Audits Cost',
    icon: Scale,
    color: 'from-slate-700 via-slate-800 to-zinc-900',
    iconColor: 'text-slate-700',
    iconBg: 'bg-slate-50 border-slate-200',
    glow: 'shadow-slate-500/10 hover:shadow-slate-500/20 border-slate-200',
    features: [
      'AI semantic parser to detect hidden legal and financial liabilities',
      'Dynamic corporate policy repository and compliance checking',
      'Auto-drafting contracts and custom legal clauses from library templates',
      'Real-time calendar updates for pending court files or corporate filings'
    ],
    techStack: ['Llama 3 70B', 'FastAPI', 'Docker', 'Python']
  },
  {
    id: 'taskvera',
    name: 'TaskVera',
    category: 'Productivity & SaaS',
    tagline: 'Project Management Core',
    description: 'Streamline high-velocity developer sprints, roadmap dependencies, and resource capacity scoring.',
    detailedDescription: 'TaskVera is an elegant, high-performance sprint management tool tailored for fast-paced developer environments. Built to eliminate status update overhead, offering real-time task mapping, Git-driven boards, and predictive delivery metrics.',
    metric: '31%',
    metricLabel: 'Increase in Sprint Velocity',
    icon: CheckSquare,
    color: 'from-violet-500 via-violet-600 to-purple-800',
    iconColor: 'text-violet-600',
    iconBg: 'bg-violet-50 border-violet-100',
    glow: 'shadow-violet-500/10 hover:shadow-violet-500/20 border-violet-100',
    features: [
      'Interactive drag-and-drop sprint boards with automated subtask linkages',
      'Git hook integrations linking pull requests straight to workflow nodes',
      'Auto-generated weekly status memos and capacity estimation engines',
      'Fast, developer-focused keyboard shortcuts and dark-mode themes'
    ],
    techStack: ['React', 'Tailwind CSS', 'WebSockets', 'Express']
  },
  {
    id: 'meetingmind',
    name: 'MeetingMind',
    category: 'AI & Collaboration',
    tagline: 'AI Speech To Text Scribe',
    description: 'Autonomous multi-speaker transcription, real-time translations, and automated task assignments.',
    detailedDescription: 'MeetingMind acts as a silent AI workspace assistant. Connecting directly to digital huddles or microphone inputs to generate diarized transcriptions, extract executive task lists, and push meeting logs straight to communication tools.',
    metric: '98.7%',
    metricLabel: 'Multi-Speaker Audio Accuracy',
    icon: Mic,
    color: 'from-purple-500 via-purple-600 to-pink-700',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 border-purple-100',
    glow: 'shadow-purple-500/10 hover:shadow-purple-500/20 border-purple-100',
    features: [
      'Voice-fingerprinting diarization separating up to 12 distinct speakers',
      'Semantic keyword taggers & executive brief generator modules',
      'Automated task pushes to Slack channels and Jira sprint lists',
      'End-to-end encryption vaults for secure, confidential session storing'
    ],
    techStack: ['Whisper API', 'PyTorch', 'AWS S3', 'FastAPI']
  },
  {
    id: 'vexhr',
    name: 'VexHR',
    category: 'Enterprise & HRMS',
    tagline: 'Human Resource Management System',
    description: 'Manage workforce directories, automated bank deposits, tax calculations, and leaf request flows.',
    detailedDescription: 'VexHR brings peace of mind to corporate HR departments. It centralizes talent files, computes regional tax deductions, routes leave requests, audit benefit structures, and processes high-scale corporate payroll in a single dashboard.',
    metric: '0',
    metricLabel: 'Payroll Processing Overruns',
    icon: Users,
    color: 'from-indigo-600 via-indigo-700 to-blue-800',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border-indigo-100',
    glow: 'shadow-indigo-500/10 hover:shadow-indigo-500/20 border-indigo-100',
    features: [
      'Visual organizational chart engines with dynamic reports routing',
      'Automated regional tax compliance & direct-deposit integrations',
      'Self-service employee request hubs for payslips and leaves tracking',
      'Dynamic workforce attendance logs & visual appraisal grids'
    ],
    techStack: ['Next.js', 'PostgreSQL', 'BullMQ', 'Node.js']
  },
  {
    id: 'kaasvex',
    name: 'KaasVex',
    category: 'FinTech & Finance',
    tagline: 'Billing & Invoicing Software',
    description: 'Scale subscription tiers, calculate GST/VAT, handle card retries, and track metrics in one place.',
    detailedDescription: 'KaasVex is a versatile, high-scale billing processor designed for subscription SaaS platforms and transaction marketplaces. Managing recurring checkouts, complex local tax configurations (like GST/VAT), retry loops, and analytics.',
    metric: '4.8%',
    metricLabel: 'Reduction in Subscription Churn',
    icon: Calculator,
    color: 'from-rose-500 via-rose-600 to-pink-700',
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border-rose-100',
    glow: 'shadow-rose-500/10 hover:shadow-rose-500/20 border-rose-100',
    features: [
      'Automated multi-currency billing and localized invoice generation',
      'Pre-built hosted secure checkout templates & overlays',
      'Smart dunning schedules and retry logic for failed credit card attempts',
      'Real-time MRR, LTV, and churn metric visualization dashboards'
    ],
    techStack: ['React', 'FastAPI', 'Stripe API', 'PostgreSQL']
  },
  {
    id: 'hullsync',
    name: 'HullSync',
    category: 'Industrial & Maritime',
    tagline: 'Ship Building Platform',
    description: 'Naval engineering workflows, supply chain material schedules, and automated structural simulations.',
    detailedDescription: 'HullSync is an industry-first naval operations pipeline tool. Integrating shipyard supply registers with real-time stress testing, buoyancy simulations, material procurement schedules, and maritime certification logs.',
    metric: '12%',
    metricLabel: 'Average Yard Material Savings',
    icon: Anchor,
    color: 'from-teal-500 via-teal-600 to-emerald-700',
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-50 border-teal-100',
    glow: 'shadow-teal-500/10 hover:shadow-teal-500/20 border-teal-100',
    features: [
      'Automated center of gravity and hull structural stress simulations',
      'Heavy materials supply chain schedule planners & procurement registries',
      'Pre-integrated bidding portals linking yard requests with steel vendors',
      'Detailed regulatory blueprints tracking compliance logs for major ship codes'
    ],
    techStack: ['Three.js', 'C++', 'WebAssembly', 'Python']
  }
];

export default function ProductsClient() {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [delistedIds, setDelistedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch visibility settings from backend
  useEffect(() => {
    const fetchVisibility = async () => {
      try {
        const response = await apiClient.getDelistedProducts();
        if (response?.success) {
          setDelistedIds(response.delisted || []);
        }
      } catch (err) {
        console.error('Failed to load visibility settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisibility();
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
  }, [delistedIds]);

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
            {products
              .map((product, i) => {
                const IconComponent = product.icon;
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
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${product.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500 mx-auto`}>
                          <IconComponent className="w-7 h-7" />
                        </div>

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
                          {product.features.slice(0, 3).map((feature) => (
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
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${selectedProduct.iconBg}`}>
                      {(() => {
                        const SelectedIcon = selectedProduct.icon;
                        return <SelectedIcon className={`w-6 h-6 ${selectedProduct.iconColor}`} />;
                      })()}
                    </div>
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
                      {selectedProduct.techStack.map((tech) => (
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
                      {selectedProduct.features.map((feature, fIndex) => (
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
