'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';
import PublicWrapper from '../wrapper'; // ✅ added
import { useRouter } from 'next/navigation';

interface ContactForm {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState("");
  const router = useRouter();

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

    setLastSubmittedEmail(data.email);   // ✅ Save email for thank-you page
    setSubmitted(true);                  // ✅ Show thank-you section
    reset();
  } catch (err: any) {
    if (err.response?.status === 409) {
      // Lead exists → still allow next step
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
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 via-gray-300 to-gray-900 px-4 py-20">
  <div className="bg-green-50 rounded-xl shadow-xl p-10 max-w-2xl w-full text-center border border-green-200">
    <div className="text-green-600 mb-4">
      <svg
        className="w-12 h-12 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>

    <p className="text-gray-600 mb-6">
      We've received your message and will get back to you soon.
    </p>

    <p className="font-semibold text-gray-800 mb-2">
      Want to maximize your project's success?
    </p>

    <p className="text-gray-600 mb-6">
      Take our quick 60-second assessment to help us understand your project needs better.
    </p>

    <a
  href={`/contact/assessment?email=${encodeURIComponent(lastSubmittedEmail)}`}
  className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
>
  Take Quick Assessment →
</a>
  </div>
</section>

      </PublicWrapper>
    );
  }

  return (
    <PublicWrapper>
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond soon.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-8 md:p-12">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      {...register('company')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={6}
                    {...register('message', { required: 'Message is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            <aside className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Corporate Office</h2>
              <p className="text-gray-600 mb-6">
                DataVex AI Private Limited<br />
                Lotus Paradise Plaza, 2nd Floor<br />
                Bendorwell, Mangalore – 575002
              </p>
              <div className="space-y-3 text-gray-700 text-sm">
                <p>
                  <span className="font-semibold">Email:</span>{' '}
                  <a href="mailto:info@datavex.ai" className="text-primary-600 hover:underline">
                    info@datavex.ai
                  </a>
                </p>
                <p>
                  <span className="font-semibold">Website:</span>{' '}
                  <a
                    href="https://www.datavex.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    www.datavex.ai
                  </a>
                </p>
                <p>
                  <span className="font-semibold">CIN:</span> U63119KA2025PTC205656
                </p>
                <p>
                  <span className="font-semibold">GSTIN:</span> 29AALCD8784G1ZX
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PublicWrapper>
  );
}
