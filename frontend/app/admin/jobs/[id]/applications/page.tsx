'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function JobApplicationsPage() {
  const params = useParams();
  const jobId = params.id as string;

  const [applications, setApplications] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      const [jobData, appsData] = await Promise.all([
        apiClient.getJob(jobId),
        apiClient.getJobApplications(jobId),
      ]);

      setJob(jobData);
      setApplications(appsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">

      <div className="mb-6">
        <Link href="/admin/jobs" className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
          ← Back to Jobs
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{job?.title} - Applications</h1>
        <p className="text-gray-600 mt-2">{applications.length} application(s)</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {app.first_name} {app.last_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{app.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{app.phone || '-'}</td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {app.score != null ? (
                    <span className={`px-2 py-1 text-xs rounded ${
                      app.score >= 75 ? 'bg-green-100 text-green-800' :
                      app.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {app.score}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'hired' ? 'bg-green-100 text-green-800' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {app.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No applications yet</p>
          </div>
        )}
      </div>

      {/* --- APPLICATION MODAL --- */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Application Details</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-semibold">Name:</label>
                <p>{selectedApp.first_name} {selectedApp.last_name}</p>
              </div>

              <div>
                <label className="font-semibold">Email:</label>
                <p>{selectedApp.email}</p>
              </div>

              <div>
                <label className="font-semibold">Phone:</label>
                <p>{selectedApp.phone || 'N/A'}</p>
              </div>

              <div>
                <label className="font-semibold">Score:</label>
                <p>{selectedApp.score ?? 'Not scored'}</p>
              </div>

              {selectedApp.skills && (
  <div>
    <label className="font-semibold">Skills:</label>

    {(() => {
      let skills: string[] = [];
      try {
        skills = JSON.parse(selectedApp.skills || "[]");
      } catch {
        skills = [];
      }

      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {skills.length > 0 ? (
            skills.map((skill: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No skills extracted</p>
          )}
        </div>
      );
    })()}
  </div>
)}


              <div>
                <label className="font-semibold">Cover Letter:</label>
                <p className="whitespace-pre-wrap">{selectedApp.cover_letter || 'No cover letter'}</p>
              </div>

              {selectedApp.resume_url && (
  <div>
    <label className="font-semibold">Resume:</label>
    <a
      href={`${process.env.NEXT_PUBLIC_API_URL}${selectedApp.resume_url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-600 hover:underline"
    >
      View Resume
    </a>
  </div>
)}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
