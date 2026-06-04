'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import PublicWrapper from '../../wrapper';
import NewsletterRenderer from '@/components/NewsletterRenderer';
import CustomFooter from '@/components/CustomFooter';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Calendar, 
  IndianRupee,
  UploadCloud, 
  CheckCircle2, 
  FileText, 
  AlertTriangle,
  User,
  Clock,
  ArrowRight,
  Link2
} from 'lucide-react';

interface ApplicationForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cover_letter: string;
  resume_url: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationForm>();

  useEffect(() => {
    loadJob();
  }, [slug]);

  const loadJob = async () => {
    try {
      const jobs = await apiClient.getJobs({ search: slug, status: 'published' });
      const foundJob = jobs.jobs.find((j: any) => j.slug === slug);

      if (foundJob) {
        const jobData = await apiClient.getJob(foundJob.id);
        setJob(jobData);
      } else {
        setJob(null);
      }
    } catch (error) {
      console.error('Failed to load job:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ApplicationForm) => {
    setSubmitting(true);
    try {
      await apiClient.submitApplication({
        job_id: job.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        cover_letter: data.cover_letter,
        resume_url: data.resume_url,
      });

      setSubmitted(true);
    } catch (error: any) {
      console.error('Failed to submit application:', error);
      alert(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <PublicWrapper>
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
          <LoaderSpinner />
          <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Role Specifications...</p>
        </div>
      </PublicWrapper>
    );
  }

  // Not Found
  if (!job) {
    return (
      <PublicWrapper>
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
          <div className="max-w-md text-center px-6 relative z-10">
            <div className="w-16 h-16 bg-amber-50 border border-amber-100 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Position Not Found</h1>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              The careers position you are looking for has been filled, archived, or is temporarily offline.
            </p>
            <Link 
              href="/careers" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg text-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> View All Active Openings
            </Link>
          </div>
        </div>
        <CustomFooter />
      </PublicWrapper>
    );
  }

  // Submission Success
  if (submitted) {
    return (
      <PublicWrapper>
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 py-24">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl p-10 max-w-md text-center relative z-10 mx-4"
          >
            <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/5">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Application Received!</h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">
              Thank you for applying to join the Datavex AI team. We will review your materials, parse your resume with our indexing engine, and get in touch with you shortly.
            </p>
            <div className="space-y-3">
              <Link
                href="/careers"
                className="block w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-sm cursor-pointer text-center"
              >
                Explore Other Openings
              </Link>
              <Link
                href="/"
                className="block w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all text-sm cursor-pointer text-center"
              >
                Go to Homepage
              </Link>
            </div>
          </motion.div>
        </div>
        <CustomFooter />
      </PublicWrapper>
    );
  }

  // Main Page
  return (
    <PublicWrapper>
      <div className="bg-[#F8F9FA] font-sans min-h-screen selection:bg-indigo-150 selection:text-indigo-900">
        
        {/* Page Hero Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-[#F8F9FA] pt-32 pb-16">
          {/* Subtle grid background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
          
          {/* Glowing blur effects */}
          <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]" />
          <div className="absolute bottom-12 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
            <Link 
              href="/careers" 
              className="inline-flex items-center gap-1.5 text-primary-650 font-bold text-sm mb-6 hover:gap-2.5 transition-all cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Careers
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl"
            >
              <div className="flex flex-wrap gap-2.5 mb-4">
                {job.department && (
                  <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-primary-100/30">
                    {job.department}
                  </span>
                )}
                {job.type && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {job.type}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                {job.title}
              </h1>

              {/* Specs badges bar */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-550 border-t border-slate-200/50 pt-6 w-full">
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-slate-400" />
                    <span className="font-semibold">{job.location}</span>
                  </div>
                )}
                {job.type && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-slate-400" />
                    <span className="font-semibold">{job.type}</span>
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4.5 h-4.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{job.salary_range}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content Body Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Job Description Spec Cards */}
            <div className="lg:col-span-7 space-y-8 text-left">
              
              <div className="bg-white rounded-[2rem] border border-slate-150 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <FileText className="w-5 h-5 text-primary-500" /> Role Overview
                </h2>
                <div className="prose prose-slate max-w-none text-slate-650 leading-relaxed text-sm">
                  <NewsletterRenderer content={job.description} />
                </div>
              </div>

              {job.requirements && (
                <div className="bg-white rounded-[2rem] border border-slate-150 p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Briefcase className="w-5 h-5 text-primary-500" /> Requirements & Competencies
                  </h2>
                  <div className="prose prose-slate max-w-none text-slate-650 leading-relaxed text-sm">
                    <NewsletterRenderer content={job.requirements} />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Dynamic Sticky Application Form */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 text-left">
              <div className="bg-white rounded-[2rem] border border-slate-150 p-8 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Apply for this Position</h2>
                <p className="text-xs text-slate-450 mb-6">Complete the forms below. Fields marked with * are required.</p>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  
                  {/* First + Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                        First Name *
                      </label>
                      <input
                        type="text"
                        placeholder="John"
                        {...register('first_name', { required: 'First name is required' })}
                        className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 transition-all text-sm font-medium"
                      />
                      {errors.first_name && (
                        <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {errors.first_name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Doe"
                        {...register('last_name', { required: 'Last name is required' })}
                        className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 transition-all text-sm font-medium"
                      />
                      {errors.last_name && (
                        <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {errors.last_name.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 transition-all text-sm font-medium"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      {...register('phone')}
                      className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 transition-all text-sm font-medium"
                    />
                  </div>

                  {/* Premium Resume Link Box */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Resume Link (Google Drive, Dropbox, etc.) *
                    </label>
                    <div className="relative flex items-center">
                      <Link2 className="absolute left-4 w-5 h-5 text-slate-400" />
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/..."
                        {...register('resume_url', {
                          required: 'Resume link is required',
                          pattern: {
                            value: /^https?:\/\/[^\s]+$/i,
                            message: 'Please enter a valid URL (starting with http:// or https://)',
                          },
                        })}
                        className="w-full h-11 pl-12 pr-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 transition-all text-sm font-medium"
                      />
                    </div>
                    {errors.resume_url && (
                      <p className="mt-1 text-xs font-semibold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {errors.resume_url.message}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 leading-normal font-medium pt-1.5">
                      Please make sure the link sharing permissions are set to "Anyone with the link can view".
                    </p>
                  </div>

                  {/* Cover Letter */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Cover Letter
                    </label>
                    <textarea
                      placeholder="Share why you are a great fit for this position..."
                      {...register('cover_letter')}
                      rows={5}
                      className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500 transition-all text-sm font-medium resize-y"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-[0.98] transition-all cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {submitting ? (
                      <>
                        <LoaderSpinner className="w-5 h-5 text-white" /> Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Application <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </section>

        <CustomFooter />
      </div>
    </PublicWrapper>
  );
}

// Simple loader components helper
function LoaderSpinner({ className = 'text-primary-600' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${className}`} />
  );
}
