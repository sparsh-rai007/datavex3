'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';

interface JobForm {
  title: string;
  slug: string;
  description: string;
  requirements: string;
  location: string;
  type: string;
  status: string;
  department: string;
  salary_range: string;
}

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<JobForm>();

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      const data = await apiClient.getJob(jobId);
      setJob(data);
      setValue('title', data.title);
      setValue('slug', data.slug);
      setValue('description', data.description);
      setValue('requirements', data.requirements || '');
      setValue('location', data.location || '');
      setValue('type', data.type || 'full-time');
      setValue('status', data.status);
      setValue('department', data.department || '');
      setValue('salary_range', data.salary_range || '');
    } catch (error) {
      console.error('Failed to load job:', error);
      router.push('/admin/jobs');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: JobForm) => {
    setSaving(true);
    try {
      await apiClient.updateJob(jobId, data);
      router.push('/admin/jobs');
    } catch (error: any) {
      console.error('Failed to update job:', error);
      alert(error.response?.data?.error || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncJob = async () => {
    setSyncing(true);
    try {
      await apiClient.syncJob(jobId);
      alert('Job sync initiated successfully.');
    } catch (error: any) {
      console.error('Failed to sync job:', error);
      alert(error.response?.data?.error || 'Failed to sync job. Check CRM configuration.');
    } finally {
      setSyncing(false);
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
    <div className="p-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <div className="mb-6">
          <button
            onClick={handleSyncJob}
            disabled={syncing}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync to CRM'}
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input {...register('title', { required: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
                <input {...register('slug', { required: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select {...register('type')} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select {...register('status')} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input {...register('location')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input {...register('department')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                <input {...register('salary_range')} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea {...register('description', { required: true })} rows={8} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                <textarea {...register('requirements')} rows={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
    </div>
  );
}

