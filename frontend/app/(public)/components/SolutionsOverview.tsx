'use client';

import { motion } from 'framer-motion';
import { 
  Brain, 
  Database, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

const solutions = [
  {
    title: 'AI & Machine Learning',
    description: 'Custom LLMs, predictive analytics, and autonomous decision systems built for scale.',
    icon: Brain,
    color: 'bg-blue-500',
  },
  {
    title: 'Data Engineering',
    description: 'High-performance data pipelines and lakehouse architectures for enterprise intelligence.',
    icon: Database,
    color: 'bg-indigo-500',
  },
  {
    title: 'Full-Stack AI Apps',
    description: 'End-to-end AI applications from API development to intuitive dashboard visualization.',
    icon: Layers,
    color: 'bg-violet-500',
  },
  {
    title: 'MLOps Enablement',
    description: 'Streamlining model deployment, monitoring, and lifecycle management for production AI.',
    icon: Cpu,
    color: 'bg-amber-500',
  },
  {
    title: 'Cybersecurity AI',
    description: 'AI-driven anomaly detection and predictive threat modeling for modern digital estates.',
    icon: ShieldCheck,
    color: 'bg-emerald-500',
  }
];

export default function SolutionsOverview() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Intelligent Solutions for the Modern Enterprise
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We bridge the gap between research and production with scalable AI infrastructure and domain-specific models.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 rounded-3xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-xl hover:border-primary-100 transition-all duration-300 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] min-w-[300px] max-w-[400px]"
            >
              <div className={`w-12 h-12 ${solution.color} rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-500/20`}>
                <solution.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                {solution.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {solution.description}
              </p>

              <Link 
                href="/solutions" 
                className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm hover:gap-3 transition-all"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
