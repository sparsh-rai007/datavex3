'use client';

import { motion, useScroll } from 'framer-motion';
import { 
  Brain, 
  Database, 
  Layers, 
  ShieldCheck, 
  Settings
} from 'lucide-react';
import { useRef } from 'react';
import CustomFooter from '@/components/CustomFooter';

const services = [
  {
    title: 'AI & Machine Learning Solutions',
    icon: Brain,
    description:
      'Develop intelligent systems tailored to your business domain—from research prototypes to production-grade deployments.',
    features: [
      'Predictive analytics & NLP workloads',
      'Custom LLM fine-tuning',
      'Autonomous decision-support systems',
    ],
    color: 'from-blue-500 to-indigo-600'
  },
  {
    title: 'Data Engineering & Cloud',
    icon: Database,
    description:
      'Build reliable data estates and cloud foundations that scale with your business and analytics ambitions.',
    features: [
      'Data lakehouse & warehouse architecture',
      'ETL/ELT workflows using Python/SQL',
      'Cloud-native AWS, Azure, & GCP infrastructure',
    ],
    color: 'from-cyan-500 to-blue-600'
  },
  {
    title: 'Full-Stack AI Applications',
    icon: Layers,
    description:
      'Deliver end-to-end applications that convert AI insights into intuitive user experiences and APIs.',
    features: [
      'Interactive dashboards & viz layers',
      'FastAPI, Flask, React, and Streamlit',
      'Enterprise application integration',
    ],
    color: 'from-indigo-500 to-purple-600'
  },
  {
    title: 'MLOps & DevOps Enablement',
    icon: Settings,
    description:
      'Operationalise intelligent systems with modern software delivery, observability, and performance tooling.',
    features: [
      'Model lifecycle & CI/CD pipelines',
      'Docker & Kubernetes orchestration',
      'GPU-based compute clusters',
    ],
    color: 'from-purple-500 to-pink-600'
  },
  {
    title: 'Cybersecurity & AI Defense',
    icon: ShieldCheck,
    description:
      'Protect mission-critical systems with AI-assisted monitoring, threat detection, and resilient architectures.',
    features: [
      'AI-driven anomaly detection',
      'Predictive threat analytics',
      'Secure data & identity monitoring',
    ],
    color: 'from-slate-700 to-slate-900'
  },
];

export default function SolutionsClient() {
  const containerRef = useRef(null);
  
  return (
    <div className="bg-slate-50 font-sans selection:bg-primary-200 selection:text-primary-900" ref={containerRef}>
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-200/30 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-200/30 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="max-w-4xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-8"
            >
              Intelligent Solutions for <br />
              <span className="text-primary-600">Modern Enterprises</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-xl text-slate-600 leading-relaxed max-w-2xl"
            >
              DataVex AI combines advanced research with scalable engineering to transform complex
              industry challenges into intelligent, automated systems.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-32">
        <div className="flex flex-wrap justify-center gap-8">
          {services.map((service, i) => (
            <motion.article
              id={`service-card-${i}`}
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group p-8 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-2xl hover:shadow-primary-100 transition-all duration-300 flex flex-col w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)]"
            >
              <div>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-primary-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 mb-8 leading-relaxed text-sm">
                  {service.description}
                </p>
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Capabilities</div>
                  <ul className="space-y-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-slate-600 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 group-hover:scale-150 transition-transform" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <CustomFooter />
    </div>
  );
}
