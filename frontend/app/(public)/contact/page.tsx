'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';
import PublicWrapper from '../wrapper';
import { motion } from 'framer-motion';
import CustomFooter from '@/components/CustomFooter';
import {
  Building2,
  Mail,
  Globe,
  Phone,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setError(null);
    setLoading(true);

    try {
      await apiClient.createLead({
        email: data.email,
        first_name: data.name.split(' ')[0] || data.name,
        last_name: data.name.split(' ').slice(1).join(' ') || '',
        company: data.company,
        phone: data.phone,
        source: 'contact_form',
        notes: data.message,
        status: 'new',
      });

      setLastSubmittedEmail(data.email);
      setSubmitted(true);
      reset();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setLastSubmittedEmail(data.email);
        setSubmitted(true);
        return;
      }

      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PublicWrapper>
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
          <section className="pt-48 pb-24 px-6 flex-1 flex items-center justify-center">
            <div className="max-w-xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white border border-slate-100 rounded-3xl p-10 md:p-12 shadow-sm text-center"
              >
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-8 mx-auto text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" strokeWidth={1.5} />
                </div>

                <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Thank You.</h1>
                <p className="text-slate-500 mb-8 leading-relaxed font-light">
                  We have received your message. Our engineering team will review your inquiry and reach out shortly.
                </p>

                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 mb-8 text-left space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-primary-600" /> Maximize project success
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Take our quick 60-second assessment so we can understand your tech stack, timeline, and engineering needs beforehand.
                  </p>
                </div>

                <a
                  href={`/contact/assessment?email=${encodeURIComponent(lastSubmittedEmail)}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-4 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Take Assessment <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            </div>
          </section>
        </div>
        <CustomFooter />
      </PublicWrapper>
    );
  }

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
                Get in <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">Touch</span>.
              </h1>

              <div className="grid md:grid-cols-2 gap-12 items-start">
                <p className="text-xl text-slate-600 leading-relaxed font-normal">
                  Have questions, feedback, or a complex engineering challenge? We would love to collaborate. Send us a message and our team will get in touch with you shortly.
                </p>
                <div className="flex gap-4 items-center border-l-2 border-slate-100 pl-8 h-full min-h-[60px]">
                  <p className="text-base text-slate-400 leading-relaxed italic">
                    Typically responds within 24 hours. Building high-performance solutions built for scale.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="flex-1">
          <div className="max-w-6xl mx-auto px-6 py-24">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

              {/* CONTACT FORM */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={itemVariants}
                className="bg-white border border-slate-100 rounded-3xl p-10 md:p-12 shadow-sm flex flex-col justify-between"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Your full name"
                        {...register('name', { required: 'Name is required' })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-slate-900 bg-slate-50/30 text-sm transition-colors"
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="you@company.com"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-slate-900 bg-slate-50/30 text-sm transition-colors"
                      />
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="Your organization"
                        {...register('company')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-slate-900 bg-slate-50/30 text-sm transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        {...register('phone')}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-slate-900 bg-slate-50/30 text-sm transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Tell us about your project, timeline, and engineering needs..."
                      {...register('message', { required: 'Message is required' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-slate-900 outline-none text-slate-900 bg-slate-50/30 text-sm transition-colors resize-none"
                    />
                    {errors.message && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </motion.div>

              {/* CORPORATE DETAILS SIDEBAR */}
              <motion.aside
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={itemVariants}
                className="bg-white border border-slate-100 rounded-3xl p-10 md:p-12 shadow-sm flex flex-col justify-between gap-12"
              >
                <div>
                  <div className="flex items-center gap-x-4">
  <Building2 className="w-8 h-8 text-primary-600" strokeWidth={1.5} />
  <h2 className="text-3xl font-bold tracking-tight text-slate-900">Corporate Office</h2>
</div>
<br></br>
                  <div className="space-y-6">
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Registered Address</div>
                      <p className="text-slate-600 font-medium leading-relaxed text-sm">
                        DataVex AI Private Limited<br />
                        Lotus Paradise Plaza, 2nd Floor<br />
                        Bendorwell, Mangalore – 575002
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-4 mb-6">
  <Globe className="w-8 h-8 text-primary-600" strokeWidth={1.5} />
  <h2 className="text-3xl font-bold tracking-tight text-slate-900">Direct Channels</h2>
</div>


                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                        <Mail className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</div>
                        <a href="mailto:info@datavex.ai" className="text-primary-600 hover:text-primary-700 hover:underline font-medium text-sm">
                          info@datavex.ai
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                        <Globe className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Website</div>
                        <a
                          href="https://www.datavex.ai"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:text-primary-700 hover:underline font-medium text-sm"
                        >
                          www.datavex.ai
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </motion.aside>

            </div>

          </div>
        </div>
      </div>
      <CustomFooter />
    </PublicWrapper>
  );
}
