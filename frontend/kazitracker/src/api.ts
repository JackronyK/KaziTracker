// API client utilities
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// =============================================================================
// TYPE DEFINITIONS (These must be exported!)
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  email: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location?: string;
  salary_range?: string;
  description: string;
  apply_url?: string;
  parsed_skills?: string;
  seniority_level?: string;
  source?: string;
  created_at: string;
}

export interface Resume {
  id: number;
  filename: string;
  file_type: string;
  tags?: string;
  created_at: string;
}

export interface Application {
  id: number;
  job_id: number;
  resume_id?: number;
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';
  notes?: string;
  applied_date?: string;
  created_at: string;
}

export interface ParsedJD {
  title: string;
  company: string;
  location?: string;
  salary_range?: string;
  seniority_level?: string;
  skills: string[];
  description: string;
  apply_url?: string;
  confidence: number;
}

// =============================================================================
// API CLIENT CLASS
// =============================================================================

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Get token from storage or instance
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data.detail || data.message || 'An error occurred';
      throw new Error(error);
    }

    return data;
  }

  // ==========================================================================
  // AUTH METHODS
  // ==========================================================================

  async signup(email: string, password: string): Promise<TokenResponse> {
    return this.request<TokenResponse>('POST', '/api/auth/signup', {
      email,
      password,
    });
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    return this.request<TokenResponse>('POST', '/api/auth/login', {
      email,
      password,
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('GET', '/api/auth/me');
  }

  // ==========================================================================
  // JOB METHODS
  // ==========================================================================

  async createJob(job: Omit<Job, 'id' | 'created_at'>): Promise<Job> {
    return this.request<Job>('POST', '/api/jobs', job);
  }

  async listJobs(): Promise<Job[]> {
    return this.request<Job[]>('GET', '/api/jobs');
  }

  async getJob(id: number): Promise<Job> {
    return this.request<Job>('GET', `/api/jobs/${id}`);
  }

  async updateJob(
    id: number,
    job: Partial<Job>,
  ): Promise<Job> {
    return this.request<Job>('PATCH', `/api/jobs/${id}`, job);
  }

  async deleteJob(id: number): Promise<void> {
    return this.request<void>('DELETE', `/api/jobs/${id}`);
  }

  // ==========================================================================
  // PARSER METHODS
  // ==========================================================================

  async parseJD(
    rawJd: string,
    url?: string,
    useLLM: boolean = false,
  ): Promise<ParsedJD> {
    return this.request<ParsedJD>('POST', '/api/parse/jd', {
      raw_jd: rawJd,
      url,
      use_llm: useLLM,
    });
  }

  // ==========================================================================
  // RESUME METHODS
  // ==========================================================================

  async uploadResume(file: File, tags?: string): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    if (tags) {
      formData.append('tags', tags);
    }

    const headers: HeadersInit = {};
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${this.baseURL}/api/resumes/upload`,
      {
        method: 'POST',
        headers,
        body: formData,
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Upload failed');
    }

    return data;
  }

  async listResumes(): Promise<Resume[]> {
    return this.request<Resume[]>('GET', '/api/resumes');
  }

  async deleteResume(id: number): Promise<void> {
    return this.request<void>('DELETE', `/api/resumes/${id}`);
  }

  // ==========================================================================
  // APPLICATION METHODS
  // ==========================================================================

  async createApplication(
    jobId: number,
    resumeId?: number,
  ): Promise<Application> {
    return this.request<Application>('POST', '/api/applications', {
      job_id: jobId,
      resume_id: resumeId,
    });
  }

  async listApplications(): Promise<Application[]> {
    return this.request<Application[]>('GET', '/api/applications');
  }

  async updateApplication(
    id: number,
    status: string,
    notes?: string,
  ): Promise<Application> {
    return this.request<Application>('PATCH', `/api/applications/${id}`, {
      status,
      notes,
    });
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('GET', '/health');
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const apiClient = new APIClient();