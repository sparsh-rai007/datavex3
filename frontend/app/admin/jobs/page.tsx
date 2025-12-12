'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api';
import Link from 'next/link';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', type: '', department: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [syncingJobId, setSyncingJobId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadJobs();
  }, [filters.status, filters.type, pagination.page]);

  const loadJobs = async () => {
    try {
      const data = await apiClient.getJobs({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        type: filters.type || undefined,
        department: filters.department || undefined,
      });
      setJobs(data.jobs);
      setPagination({ ...pagination, total: data.pagination.total });
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await apiClient.exportJobs();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jobs-${new Date().toISOString()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export jobs:', error);
      alert('Failed to export jobs');
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      await apiClient.importJobs(text, 'csv');
      alert('Jobs imported successfully');
      loadJobs();
    } catch (error) {
      console.error('Failed to import jobs:', error);
      alert('Failed to import jobs');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await apiClient.deleteJob(id);
      loadJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job');
    }
  };

  const handleSyncJob = async (jobId: string) => {
    setSyncingJobId(jobId);
    try {
      await apiClient.syncJob(jobId);
      alert('Job sync initiated successfully.');
    } catch (error: any) {
      console.error('Failed to sync job:', error);
      alert(error.response?.data?.error || 'Failed to sync job. Check CRM configuration.');
    } finally {
      setSyncingJobId(null);
    }
  };

  return (
    <div className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin/jobs/new"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create New Job
            </Link>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <button
              onClick={handleImportClick}
              disabled={importing}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import CSV'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
            <input
              type="text"
              placeholder="Department..."
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={loadJobs}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Jobs Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      <div className="text-sm text-gray-500">{job.department || 'No department'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.type || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.location || 'Remote'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        job.status === 'published' ? 'bg-green-100 text-green-800' :
                        job.status === 'closed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/jobs/${job.id}/applications`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Applications
                      </Link>
                      <button
                        onClick={() => handleSyncJob(job.id)}
                        disabled={syncingJobId === job.id}
                        className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                      >
                        {syncingJobId === job.id ? 'Syncing...' : 'Sync to CRM'}
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {jobs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No jobs found</p>
              </div>
            )}
          </div>
        )}
    </div>
  );
}

