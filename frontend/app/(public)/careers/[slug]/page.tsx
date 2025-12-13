'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import PublicWrapper from '../../wrapper'; // ✅ ADD THIS

interface ApplicationForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cover_letter: string;
  resume: FileList;
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
      const formData = new FormData();
      formData.append('job_id', job.id);
      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('cover_letter', data.cover_letter);
      if (data.resume && data.resume[0]) {
        formData.append('resume', data.resume[0]);
      }

      const axios = require('axios');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

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
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PublicWrapper>
    );
  }

  // Not Found
  if (!job) {
    return (
      <PublicWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <Link href="/careers" className="text-primary-600 hover:text-primary-700">
              View All Jobs
            </Link>
          </div>
        </div>
      </PublicWrapper>
    );
  }

  // Submission Success
  if (submitted) {
    return (
      <PublicWrapper>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest. We'll review your application and get back to you soon.
            </p>
            <Link
              href="/careers"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              View Other Jobs
            </Link>
          </div>
        </div>
      </PublicWrapper>
    );
  }

  // Main Page
  return (
    <PublicWrapper>
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/careers" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Careers
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{job.title}</h1>

            <div className="flex flex-wrap gap-4 mb-6">
              {job.location && (
                <span className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </span>
              )}
              {job.type && (
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {job.type}
                </span>
              )}
              {job.department && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {job.department}
                </span>
              )}
            </div>

            <div className="prose max-w-none mb-8">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <div className="whitespace-pre-wrap text-gray-700">{job.description}</div>

              {job.requirements && (
                <>
                  <h2 className="text-2xl font-semibold mb-4 mt-8">Requirements</h2>
                  <div className="whitespace-pre-wrap text-gray-700">{job.requirements}</div>
                </>
              )}

              {job.salary_range && (
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <strong>Salary Range:</strong> {job.salary_range}
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for this Position</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* First + Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    {...register('first_name', { required: 'First name is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    {...register('last_name', { required: 'Last name is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Resume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume (PDF, DOC, DOCX) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  {...register('resume', { required: 'Resume is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {errors.resume && (
                  <p className="mt-1 text-sm text-red-600">{errors.resume.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Your resume will be automatically parsed with AI to extract skills and experience.
                </p>
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  {...register('cover_letter')}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PublicWrapper>
  );
}

