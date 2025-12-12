'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useForm } from 'react-hook-form';

export default function SocialSettingsPage() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    loadStoredCredentials();
  }, []);

  const loadStoredCredentials = async () => {
    try {
      const data = await apiClient.getSocialCredentials();
      reset(data);   // ← FIXED
    } catch (error) {
      console.error("Failed to load credentials", error);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await apiClient.saveSocialCredentials({
        linkedin: {
          client_id: data.linkedin_client_id,
          client_secret: data.linkedin_client_secret,
          access_token: data.linkedin_access_token,
        },
        reddit: {
          client_id: data.reddit_client_id,
          client_secret: data.reddit_client_secret,
          refresh_token: data.reddit_refresh_token,
        },
        instagram: {
          client_id: data.instagram_app_id,
          client_secret: data.instagram_app_secret,
          access_token: data.instagram_access_token,
          page_id: data.instagram_page_id,
          ig_user_id: data.instagram_ig_user_id,
        },
      });

      alert("Credentials saved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Social Media Integrations</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* LinkedIn */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">LinkedIn</h2>
          <input {...register("linkedin_client_id")} placeholder="Client ID" className="input" />
          <input {...register("linkedin_client_secret")} placeholder="Client Secret" className="input" />
          <input {...register("linkedin_access_token")} placeholder="Access Token" className="input" />
        </div>

        {/* Reddit */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Reddit</h2>
          <input {...register("reddit_client_id")} placeholder="Client ID" className="input" />
          <input {...register("reddit_client_secret")} placeholder="Client Secret" className="input" />
          <input {...register("reddit_refresh_token")} placeholder="Refresh Token" className="input" />
        </div>

        {/* Instagram */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Instagram (Business)</h2>
          <input {...register("instagram_app_id")} placeholder="App ID" className="input" />
          <input {...register("instagram_app_secret")} placeholder="App Secret" className="input" />
          <input {...register("instagram_access_token")} placeholder="Access Token" className="input" />
          <input {...register("instagram_page_id")} placeholder="Facebook Page ID" className="input" />
          <input {...register("instagram_ig_user_id")} placeholder="Instagram Business Account ID" className="input" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary-600 text-white rounded"
        >
          {loading ? "Saving..." : "Save Credentials"}
        </button>
      </form>
    </div>
  );
}
