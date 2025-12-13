'use client';


import { useState, useEffect } from 'react';

import { apiClient } from '@/lib/api';


export default function AssessmentPage() {

  const [email, setEmail] = useState<string | null>(null);



  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [answers, setAnswers] = useState({
    projectStage: '',
    budget: '',
    aiTools: '',
    motivation: '',
    location: '',
    employees: '',
    experience: ''
  });
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  setEmail(params.get('email'));
}, []);

  const updateField = (field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await apiClient.submitAssessment({
        email,
        answers: {
          ...answers,
          employees: Number(answers.employees),
          experience: Number(answers.experience),
        }
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Try again.');
    }

    setLoading(false);
  };

  /* ------------------------------------------------------------------
     🎉 PREMIUM THANK YOU SCREEN
  ------------------------------------------------------------------ */
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 px-4">
        <div className="bg-white shadow-2xl rounded-2xl p-12 max-w-xl w-full text-center border border-gray-100">

          <svg className="w-20 h-20 text-green-600 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thank You!</h1>

          <p className="text-gray-600 text-lg leading-relaxed mb-10">
            Your assessment has been submitted successfully.  
            Our team will review your details and get back to you soon.
          </p>

          <a
            href="/"
            className="inline-block bg-primary-600 text-white px-10 py-3 rounded-lg shadow-lg hover:bg-primary-700 transition"
          >
            Back to Home →
          </a>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------
     🌟 PREMIUM ASSESSMENT UI
  ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 flex justify-center py-20 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-3xl w-full border border-gray-200">

        {/* HEADER */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Quick Project Assessment</h1>
        <p className="text-gray-600 text-center mb-12 text-lg">
          Answer these short questions so we can understand your requirements better.
        </p>

        {/* FORM CONTENT */}
        <div className="space-y-8">

          {/* 1 */}
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              1. What stage is your project in?
            </label>
            <select
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={answers.projectStage}
              onChange={e => updateField('projectStage', e.target.value)}
            >
              <option value="">Select...</option>
              <option>Idea</option>
              <option>Prototype</option>
              <option>MVP</option>
              <option>Live Product</option>
            </select>
          </div>

          {/* 2 */}
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              2. What is your estimated budget?
            </label>
            <select
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={answers.budget}
              onChange={e => updateField('budget', e.target.value)}
            >
              <option value="">Select...</option>
              <option>Under $5,000</option>
              <option>$5,000 - $15,000</option>
              <option>$15,000 - $30,000</option>
              <option>Above $30,000</option>
            </select>
          </div>

          {/* 3 */}
          {/* 3. AI Tools (Yes/No) */}
<div>
  <label className="block font-semibold text-gray-800 mb-2">
    3. Do you use any AI tools currently?
  </label>

  <select
    className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50
               focus:ring-2 focus:ring-primary-500 focus:outline-none"
    value={answers.aiTools}
    onChange={e => updateField('aiTools', e.target.value)}
  >
    <option value="">Select...</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
</div>


          {/* 4 */}
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              4. What is the main goal of your project?
            </label>
            <textarea
              rows={3}
              placeholder="E.g., reduce manual work, improve customer experience..."
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={answers.motivation}
              onChange={e => updateField('motivation', e.target.value)}
            />
          </div>

          {/* 5 */}
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              5. Where are you located?
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={answers.location}
              onChange={e => updateField('location', e.target.value)}
            />
          </div>

          {/* 6 */}
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              6. How many employees do you have?
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={answers.employees}
              onChange={e => updateField('employees', e.target.value)}
            />
          </div>

          {/* 7 */}
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              7. How much experience do you have in tech?
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={answers.experience}
              onChange={e => updateField('experience', e.target.value)}
            />
          </div>

        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-12 bg-primary-600 text-white text-lg py-3 rounded-xl shadow-lg hover:bg-primary-700 transition disabled:opacity-50"
        >
          {loading ? 'Submitting…' : 'Submit Assessment'}
        </button>

      </div>
    </div>
  );
}

