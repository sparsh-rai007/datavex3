import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("❌ NEXT_PUBLIC_API_URL is missing. Define it in your environment variables.");
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });



    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
   

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const response = await axios.post(
              `${API_URL}/api/auth/refresh`,
              {},
              { withCredentials: true }
            );

            const { accessToken } = response.data;
            Cookies.set('accessToken', accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            Cookies.remove('accessToken');
            window.location.href = '/admin/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
    // ⭐ ADD THIS BELOW THE CONSTRUCTOR ⭐

  private async request(method: string, url: string, body?: any) {
    return this.client.request({
      method,
      url,
      data: body
    });
  }

  async post(url: string, body?: any) {
    return this.request("POST", url, body);
  }

// REGISTER (New User Signup)
// REGISTER (New User Signup)
async register(data: { firstName: string; lastName: string; email: string; password: string }) {
  const response = await this.client.post('/auth/register', data);
  return response.data; // { user }
}
// Bookings endpoints

async approveBooking(id: string) {
  return this.post(`/bookings/${id}/approve`);
}

async rejectBooking(id: string) {
  return this.post(`/bookings/${id}/reject`);
}

async getBlogs() {
  const response = await this.client.get('/blogs');
  return response.data;
}

async getBlog(id: string) {
  const response = await this.client.get(`/blogs/${id}`);
  return response.data;
}

async createBlog(data: any) {
  const response = await this.client.post('/blogs', {
    ...data,
    external_url: data.external_url || null,
  });
  return response.data;
}


async updateBlog(id: string, data: any) {
  const response = await this.client.put(`/blogs/${id}`, {
    ...data,
    external_url: data.external_url || null,
  });
  return response.data;
}


async deleteBlog(id: string) {
  const response = await this.client.delete(`/blogs/${id}`);
  return response.data;
}

async getPublicBlogs() {
  const response = await this.client.get('/blogs/public/all', {
    withCredentials: false,
  });
  return response.data.blogs;
}



async getPublicBlog(slug: string) {
  const response = await this.client.get(`/blogs/public/${slug}`, {
    withCredentials: false,
  });
  return response.data;
}

async getSocialCredentials() {
  const response = await this.client.get("/social/credentials");
  const data = response.data;

  return {
    linkedin_client_id: data.linkedin?.client_id || "",
    linkedin_client_secret: data.linkedin?.client_secret || "",
    linkedin_access_token: data.linkedin?.access_token || "",

    reddit_client_id: data.reddit?.client_id || "",
    reddit_client_secret: data.reddit?.client_secret || "",
    reddit_refresh_token: data.reddit?.refresh_token || "",

    instagram_app_id: data.instagram?.client_id || "",
    instagram_app_secret: data.instagram?.client_secret || "",
    instagram_access_token: data.instagram?.access_token || "",
    instagram_page_id: data.instagram?.page_id || "",
    instagram_ig_user_id: data.instagram?.ig_user_id || "",
  };
}


async saveSocialCredentials(data: any) {
  // frontend already sends the correct structure
  return (await this.client.post("/social/credentials", data)).data;
}


async publishToSocial(data: any) {
  const response = await this.client.post("/social/publish", data);
  return response.data;
}

async getAdminUsers() {
  return (await this.client.get("/admin/users")).data;
}

async createAdminUser(data: any) {
  return (await this.client.post("/admin/users", data)).data;
}

async deleteAdminUser(id: string) {
  return (await this.client.delete(`/admin/users/${id}`)).data;
}

async updateUserRole(id: string, role: string) {
  return (await this.client.put(`/admin/users/${id}/role`, { role })).data;
}

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    const { accessToken, user } = response.data;
    Cookies.set('accessToken', accessToken);
    return { user };
  }

  async logout() {
  try {
    await this.client.post('/auth/logout');
  } catch (err) {
    console.warn("Logout error ignored:", err);
  }
  Cookies.remove('accessToken');
}


  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async refreshToken() {
    const response = await this.client.post('/auth/refresh');
    const { accessToken } = response.data;
    Cookies.set('accessToken', accessToken);
    return accessToken;
  }

  // Admin endpoints
  async getDashboardStats() {
    const response = await this.client.get('/admin/dashboard/stats');
    return response.data;
  }

  // Posts endpoints
  async getPosts(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const response = await this.client.get('/posts', { params });
    return response.data;
  }

  async getPost(id: string) {
    const response = await this.client.get(`/posts/${id}`);
    return response.data;
  }

  async createPost(data: any) {
    const response = await this.client.post('/posts', data);
    return response.data;
  }

  async updatePost(id: string, data: any) {
    const response = await this.client.put(`/posts/${id}`, data);
    return response.data;
  }

  async deletePost(id: string) {
    const response = await this.client.delete(`/posts/${id}`);
    return response.data;
  }

  async getPostRevisions(postId: string) {
    const response = await this.client.get(`/posts/${postId}/revisions`);
    return response.data;
  }
 async getBookings() {
  const response = await this.client.get("/bookings");
  return response.data;
}
  // Leads endpoints
  async getLeads(params?: { page?: number; limit?: number; status?: string; source?: string; search?: string }) {
    const response = await this.client.get('/leads', { params });
    return response.data;
  }

  async exportLeads() {
    const response = await this.client.get('/leads/export', { responseType: 'blob' });
    return response.data;
  }

  async getLead(id: string) {
    const response = await this.client.get(`/leads/${id}`);
    return response.data;
  }

  async syncLead(id: string) {
    const response = await this.client.post(`/leads/${id}/sync`);
    return response.data;
  }

  async updateLead(id: string, data: any) {
    const response = await this.client.put(`/leads/${id}`, data);
    return response.data;
  }

  async deleteLead(id: string) {
    const response = await this.client.delete(`/leads/${id}`);
    return response.data;
  }
async submitAssessment(data: any) {
  const response = await this.client.post('/leads/assessment', data);
  return response.data;
}

  // Jobs endpoints
  async getJobs(params?: { page?: number; limit?: number; status?: string; type?: string; department?: string; search?: string }) {
    const response = await this.client.get('/jobs', { params });
    return response.data;
  }

  async exportJobs() {
    const response = await this.client.get('/jobs/export', { responseType: 'blob' });
    return response.data;
  }

  async importJobs(data: string, format: 'csv' | 'json' = 'csv') {
    const response = await this.client.post('/jobs/import', { data, format });
    return response.data;
  }

  async getJob(id: string) {
    const response = await this.client.get(`/jobs/${id}`);
    return response.data;
  }

  async syncJob(id: string) {
    const response = await this.client.post(`/jobs/${id}/sync`);
    return response.data;
  }

  async createJob(data: any) {
    const response = await this.client.post('/jobs', data);
    return response.data;
  }

  async updateJob(id: string, data: any) {
    const response = await this.client.put(`/jobs/${id}`, data);
    return response.data;
  }

  async deleteJob(id: string) {
    const response = await this.client.delete(`/jobs/${id}`);
    return response.data;
  }

  async getJobApplications(jobId: string, status?: string) {
    const response = await this.client.get(`/jobs/${jobId}/applications`, { params: { status } });
    return response.data;
  }

  // Job Applications endpoints
  async getApplications(params?: { job_id?: string; status?: string }) {
    const response = await this.client.get('/applications', { params });
    return response.data;
  }

  async getApplication(id: string) {
    const response = await this.client.get(`/applications/${id}`);
    return response.data;
  }

  async updateApplication(id: string, data: any) {
    const response = await this.client.put(`/applications/${id}`, data);
    return response.data;
  }

  async parseResumeForApplication(appId: string, resumeText: string) {
    const response = await this.client.post(`/applications/${appId}/parse-resume`, { resumeText });
    return response.data;
  }

  // AI endpoints
  async getContentSuggestions(data: { content: string; title?: string; type?: string; targetAudience?: string }) {
    const response = await this.client.post('/ai/content/suggest', data);
    return response.data;
  }

  async getSEOSuggestions(data: { title?: string; metaDescription?: string; content?: string; keywords?: string[] }) {
    const response = await this.client.post('/ai/seo/suggest', data);
    return response.data;
  }

  async scoreLead(data: { email?: string; company?: string; source?: string; notes?: string; metadata?: any }) {
    const response = await this.client.post('/ai/leads/score', data);
    return response.data;
  }

  async parseResume(resumeText: string) {
    const response = await this.client.post('/ai/resume/parse', { resumeText });
    return response.data;
  }

  async chat(message: string, history?: Array<{ role: string; content: string }>) {
    const response = await this.client.post('/ai/chat', { message, history });
    return response.data;
  }

  // Public endpoints (no auth required)
  async createLead(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    phone?: string;
    source?: string;
    notes?: string;
    status?: string;
  }) {
    const response = await this.client.post('/leads', data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
