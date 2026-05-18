'use client';

import { motion } from 'framer-motion';
import { Monitor, Server, Brain, Cloud, Eye, ShieldCheck } from 'lucide-react';
import image from '../../public/image.png';

const capabilities = [
  { icon: Monitor, label: 'Frontend Craft', desc: 'React, Vue, and high-fidelity UX' },
  { icon: Server, label: 'Backend Systems', desc: 'FastAPI, Node.js, and database scaling' },
  { icon: Brain, label: 'AI Modeling', desc: 'Custom models, ML analytics, and NLP' },
  { icon: Cloud, label: 'Cloud & MLOps', desc: 'AWS, GCP, Docker, and Kubernetes' },
  { icon: Eye, label: 'Observability', desc: 'Prometheus, Grafana, and ELK stack' },
  { icon: ShieldCheck, label: 'Security Built-in', desc: 'Zero-trust architecture and scanning' },
];

export default function TechnologyStack() {
  return (
    <section className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col justify-between h-full"
          >
            <div>
              <div className="inline-block px-4 py-1.5 bg-primary-50 text-primary-600 font-semibold tracking-wider uppercase text-xs rounded-full mb-6">
                Technology stack
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                Modern engineering foundations for serious AI programs.
              </h2>
              <h3 className="text-lg text-gray-600 leading-relaxed mb-8">
                DataVex combines frontend product craft, backend systems, AI modeling, cloud infrastructure, monitoring, and security into one delivery motion.
              </h3>
            </div>

            {/* Mirroring the diagram's 6 components */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
              {capabilities.map((cap) => (
                <div key={cap.label} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary-100/70 text-primary-600 mt-1">
                    <cap.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{cap.label}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary-500/10 border border-gray-200/50 bg-white p-2"
          >
            <div className="rounded-2xl overflow-hidden bg-gray-100">
              <img 
                src={image.src}
                alt="DataVex Technology Stack Overview" 
                className="w-full h-auto transition-transform duration-700"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
