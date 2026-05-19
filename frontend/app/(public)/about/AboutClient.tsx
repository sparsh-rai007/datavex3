'use client';

import PublicWrapper from "../wrapper";
import CustomFooter from "@/components/CustomFooter";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Database,
  Layout,
  Rocket,
  ShieldCheck,
  GraduationCap,
  Building2,
  Mail,
  Globe
} from "lucide-react";

const coreServices = [
  {
    title: "AI & Machine Learning Solutions",
    icon: BrainCircuit,
    points: [
      "Predictive analytics, NLP, and computer vision systems",
      "LLM fine-tuning and custom AI model development",
      "AI agents, chatbots, and autonomous decision systems",
    ],
  },
  {
    title: "Data Engineering & Cloud Infrastructure",
    icon: Database,
    points: [
      "Scalable data pipelines and lakehouse architectures",
      "ETL workflows using Python, PySpark, and SQL",
      "Cloud-native deployments across AWS, Azure, and GCP",
    ],
  },
  {
    title: "Full-Stack AI Applications",
    icon: Layout,
    points: [
      "AI-powered dashboards and visualization layers",
      "API development with FastAPI, Flask, React, and Streamlit",
      "Integration of AI systems with business workflows",
    ],
  },
  {
    title: "MLOps & DevOps",
    icon: Rocket,
    points: [
      "CI/CD automation, model versioning, and observability",
      "Container orchestration using Docker & Kubernetes",
      "GPU clusters and performance scaling strategies",
    ],
  },
  {
    title: "Cybersecurity & AI Defense",
    icon: ShieldCheck,
    points: [
      "AI-driven anomaly detection and predictive threat modeling",
      "Secure data pipelines and network monitoring",
    ],
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AboutClient() {
  return (
    <PublicWrapper>
      <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">

        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white pt-48 pb-24 px-6 border-b border-slate-100">
          {/* Subtle grid background pattern */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
          
          {/* Glowing blur effects */}
          <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"></div>
          <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl md:text-8xl font-bold text-slate-900 tracking-tighter leading-[0.95] mb-12">
                About <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">Us</span>.
              </h1>

              <div className="grid md:grid-cols-2 gap-12 items-start">
                <p className="text-xl text-slate-600 leading-relaxed font-normal">
                  DataVex AI is a technology company specializing in
                  Artificial Intelligence, Data Engineering, and
                  Cloud Systems. We build the infrastructure for the next generation of digital transformation.
                </p>
                <p className="text-lg text-slate-400 leading-relaxed italic border-l-2 border-slate-100 pl-8">
                  "Our mission is to empower organizations to harness the power
                  of intelligent systems, driving measurable impact and sustainable growth."
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="flex-1">
          <div className="max-w-6xl mx-auto px-6 py-24 space-y-40">

            {/* VISION SECTION */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={itemVariants}
              className="grid lg:grid-cols-[0.8fr_1fr] gap-20 items-center py-16 border-y border-slate-50"
            >
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-6">Our Vision</h2>
                <div className="w-12 h-1 bg-primary-600" />
              </div>
              <p className="text-2xl text-slate-600 leading-relaxed font-light">
                To become a global leader in AI-driven innovation — enabling
                industries to evolve intelligently through automation, analytics,
                and adaptive technologies.
              </p>
            </motion.section>

            {/* SERVICES GRID */}
            <section>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
                <div className="max-w-xl">
                  <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Core Services</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    We design and deliver end-to-end AI solutions that convert
                    complex problems into intelligent, scalable systems.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {coreServices.map((service, index) => (
                  <motion.div
                    key={service.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } }
                    }}
                    className="group"
                  >
                    <div className="mb-6">
                      <service.icon className="w-8 h-8 text-primary-600 mb-6" strokeWidth={1.5} />
                      <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
                        {service.title}
                      </h3>
                      <ul className="space-y-3 text-slate-500">
                        {service.points.map((point, i) => (
                          <li key={i} className="flex gap-3 items-start">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 shrink-0" />
                            <span className="text-sm leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* TRAINING & INTERNSHIP */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={itemVariants}
              className="grid lg:grid-cols-[0.8fr_1fr] gap-20 items-start py-16 border-t border-slate-50"
            >
              <div>
                <GraduationCap className="w-10 h-10 text-primary-600 mb-6" strokeWidth={1.5} />
                <h2 className="text-4xl font-bold tracking-tight mb-6">Training & Internship</h2>
                <div className="w-12 h-1 bg-primary-600" />
              </div>
              <p className="text-xl text-slate-600 leading-relaxed font-light">
                DataVex provides structured internship and mentorship programs for
                engineering students, offering hands-on experience in AI/ML,
                data engineering, and full-stack development. Interns work on live
                projects, gain industry-level exposure, and develop skills aligned
                with real-world technical demands.
              </p>
            </motion.section>

            {/* CORPORATE & CONTACT (Footer-style clean blocks) */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={itemVariants}
              className="grid md:grid-cols-2 gap-16 py-16 border-t border-slate-50"
            >
              {/* Corporate Details */}
              <div>
                <Building2 className="w-8 h-8 text-primary-600 mb-6" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold tracking-tight mb-8">Corporate Details</h3>

                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Registered Office</div>
                    <p className="text-slate-600 font-medium">Lotus Paradise Plaza, 2nd Floor,<br />Bendorwell, Mangalore – 575002</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-4">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CIN</div>
                      <p className="text-slate-600 font-mono text-sm">U63119KA2025PTC205656</p>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">GSTIN</div>
                      <p className="text-slate-600 font-mono text-sm">29AALCD8784G1ZX</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connect */}
              <div>
                <Globe className="w-8 h-8 text-primary-600 mb-6" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold tracking-tight mb-8">Connect With Us</h3>

                <div className="space-y-8 pt-2">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-primary-600 mt-1" strokeWidth={1.5} />
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</div>
                      <a href="mailto:info@datavex.ai" className="text-lg text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors">
                        info@datavex.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Globe className="w-6 h-6 text-primary-600 mt-1" strokeWidth={1.5} />
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Website</div>
                      <a href="https://www.datavex.ai" target="_blank" rel="noreferrer" className="text-lg text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors">
                        www.datavex.ai
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

          </div>
        </div>
      </div>
      <CustomFooter />
    </PublicWrapper>
  );
}
