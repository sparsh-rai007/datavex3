"use client";

import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import Link from "next/link";
import PublicWrapper from "../wrapper";
import CustomFooter from "@/components/CustomFooter";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";

export default function ConsultationPage() {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", { layout: "month_view" });
    })();
  }, []);

  return (
    <PublicWrapper>
      <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900 antialiased">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white pt-36 pb-20 border-b border-gray-100">
          {/* Subtle grid background pattern */}
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
          
          {/* Glowing blur effects */}
          <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"></div>
          <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              

              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] flex items-center justify-center gap-3 flex-wrap">
                Book a <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">Consultation</span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
                Schedule a 30-minute technical discovery session with our core engineering team to map out your system architecture, timelines, and goals.
              </p>
            </motion.div>
          </div>
        </section>

        {/* CAL.COM EMBED */}
        <div className="flex-1 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border border-slate-100 rounded-3xl p-4 md:p-8 shadow-xl shadow-primary-500/5"
            >
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-50">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                  <Calendar className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Technical Discovery Call</h3>
                  <p className="text-xs text-slate-400">30 minutes • Video conference link provided on confirmation</p>
                </div>
              </div>

              <Cal
                calLink="darshan.suvarna/30min"
                style={{ width: "100%", minHeight: "650px" }}
                config={{ layout: "month_view" }}
              />
            </motion.div>
          </div>
        </div>

      </div>
      <CustomFooter />
    </PublicWrapper>
  );
}
