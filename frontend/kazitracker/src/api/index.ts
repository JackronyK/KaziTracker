// src/api/index.ts
import type {
  TokenResponse,
  User,
  Job,
  JobInput,
  ParsedJD,
  Application,
  ApplicationInput,
  ApplicationUpdate,
  Resume,
  ApiError,
} from '../types/index'; // adjust path if necessary
import type {
  Interview,
  Offer,
  Deadline,} from '../types/Premium';
import { API_URL, ERROR_MESSAGES, API_TIMEOUT } from '../utils/constants';
import { logError, logInfo, errorLogger } from '../utils/errorLogger';

// =============================================================================
// API CLIENT CLASS
// =============================================================================

class APIClient {
  private baseURL: string;
  private token: string | null = null;
  private timeout: number;

  constructor(baseURL: string = API_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.token = this.getStoredToken();
  }

  // =========================================================================
  // TOKEN MANAGEMENT
  // =========================================================================
  setToken(token: string) {
    this.token = token;
    try {
      localStorage.setItem('token', token);
    } catch {
      /* noop in SSR / restricted storage */
    }
    logInfo('Token set successfully');
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('token') || null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return this.token || this.getStoredToken();
  }

  clearToken() {
    this.token = null;
    try {
      localStorage.removeItem('token');
    } catch {
      /* noop */
    }
    logInfo('Token cleared - user logged out');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // =========================================================================
  // CORE REQUEST HANDLER
  // =========================================================================
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    isFormData: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {};

    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (!isFormData) headers['Content-Type'] = 'application/json';

    const config: RequestInit = {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    };

    logInfo(`API Request: ${method} ${endpoint}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, { ...config, signal: controller.signal });
      clearTimeout(timeoutId);

      // Try parse JSON (may be null)
      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const error = (data || {}) as ApiError;
        const errorMessage = error.detail || error.message || ERROR_MESSAGES.UNEXPECTED_ERROR;

        logError(`API Error: ${method} ${endpoint}`, undefined, {
          status: response.status,
          message: errorMessage,
          endpoint,
        });

        if (response.status === 401) {
          this.clearToken();
        }

        // include body text when available for easier debugging
        const serverText = typeof data === 'string' ? data : JSON.stringify(data);
        throw new Error(`${errorMessage} (status ${response.status}) - ${serverText}`);
      }

      logInfo(`API Success: ${method} ${endpoint}`, { status: response.status });
      return data as T;
    } catch (err) {
      // network / abort
      if (err instanceof DOMException && err.name === 'AbortError') {
        logError('Request timeout', err as Error, { endpoint, method });
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      if (err instanceof TypeError) {
        logError('Network Error', err as Error, { endpoint, method });
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      if (err instanceof SyntaxError) {
        logError('Invalid Response Format', err as Error, { endpoint, method });
        throw new Error('Invalid response from server');
      }

      logError(`Request Failed: ${method} ${endpoint}`, err as Error);
      throw err;
    }
  }

  // =========================================================================
  // AUTH
  // =========================================================================
  async signup(email: string, password: string): Promise<TokenResponse> {
    try {
      logInfo('Signup attempt', { email });
      const response = await this.request<TokenResponse>('POST', '/api/auth/signup', { email, password });
      this.setToken(response.access_token);
      return response;
    } catch (error) {
      logError('Signup failed', error as Error, { email });
      throw error;
    }
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    try {
      logInfo('Login attempt', { email });
      const response = await this.request<TokenResponse>('POST', '/api/auth/login', { email, password });
      this.setToken(response.access_token);
      return response;
    } catch (error) {
      logError('Login failed', error as Error, { email });
      throw error;
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      return await this.request<User>('GET', '/api/auth/me');
    } catch (error) {
      logError('Failed to fetch current user', error as Error);
      throw error;
    }
  }

  // =========================================================================
  // JOBS
  // =========================================================================
  async createJob(job: JobInput): Promise<Job> {
    try {
      logInfo('Creating job', { company: job.company, title: job.title });
      return await this.request<Job>('POST', '/api/jobs', job);
    } catch (error) {
      logError('Failed to create job', error as Error);
      throw error;
    }
  }

  async listJobs(): Promise<Job[]> {
    try {
      return await this.request<Job[]>('GET', '/api/jobs');
    } catch (error) {
      logError('Failed to fetch jobs', error as Error);
      throw error;
    }
  }

  async getJob(id: number): Promise<Job> {
    try {
      return await this.request<Job>('GET', `/api/jobs/${id}`);
    } catch (error) {
      logError('Failed to fetch job', error as Error, { jobId: id });
      throw error;
    }
  }

  async updateJob(id: number, job: Partial<JobInput>): Promise<Job> {
    try {
      return await this.request<Job>('PATCH', `/api/jobs/${id}`, job);
    } catch (error) {
      logError('Failed to update job', error as Error, { jobId: id });
      throw error;
    }
  }

  async deleteJob(id: number): Promise<void> {
    try {
      await this.request<void>('DELETE', `/api/jobs/${id}`);
    } catch (error) {
      logError('Failed to delete job', error as Error, { jobId: id });
      throw error;
    }
  }

  // =========================================================================
  // PARSER
  // =========================================================================
  async parseJD(rawJd: string, url?: string, useLLM: boolean = false): Promise<ParsedJD> {
    try {
      return await this.request<ParsedJD>('POST', '/api/parse/jd', { raw_jd: rawJd, url, use_llm: useLLM });
    } catch (error) {
      logError('Failed to parse job description', error as Error);
      throw error;
    }
  }

  // =========================================================================
  // APPLICATIONS
  // =========================================================================
  async createApplication(app: ApplicationInput): Promise<Application> {
    try {
      return await this.request<Application>('POST', '/api/applications', app);
    } catch (error) {
      logError('Failed to create application', error as Error);
      throw error;
    }
  }

  async listApplications(): Promise<Application[]> {
    try {
      return await this.request<Application[]>('GET', '/api/applications');
    } catch (error) {
      logError('Failed to fetch applications', error as Error);
      throw error;
    }
  }

  async getApplication(id: number): Promise<Application> {
    try {
      return await this.request<Application>('GET', `/api/applications/${id}`);
    } catch (error) {
      logError('Failed to fetch application', error as Error, { appId: id });
      throw error;
    }
  }

  async updateApplication(id: number, app: ApplicationUpdate): Promise<Application> {
    try {
      return await this.request<Application>('PATCH', `/api/applications/${id}`, app);
    } catch (error) {
      logError('Failed to update application', error as Error, { appId: id });
      throw error;
    }
  }

  async updateApplicationStatus(
    id: number,
    status: string,
    dates?: { applied_date?: string; interview_date?: string; offer_date?: string; rejected_date?: string }
  ): Promise<Application> {
    try {
      const update: ApplicationUpdate = { status, ...dates };
      return await this.request<Application>('PATCH', `/api/applications/${id}`, update);
    } catch (error) {
      logError('Failed to update application status', error as Error, { appId: id });
      throw error;
    }
  }

  async deleteApplication(id: number): Promise<void> {
    try {
      await this.request<void>('DELETE', `/api/applications/${id}`);
    } catch (error) {
      logError('Failed to delete application', error as Error, { appId: id });
      throw error;
    }
  }

  // =========================================================================
  // RESUMES
  // =========================================================================
  async uploadResume(file: File, tags?: string): Promise<Resume> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (tags) formData.append('tags', tags);
      return await this.request<Resume>('POST', '/api/resumes/upload', formData, true);
    } catch (error) {
      logError('Failed to upload resume', error as Error, { filename: file.name });
      throw error;
    }
  }

  async listResumes(): Promise<Resume[]> {
    try {
      return await this.request<Resume[]>('GET', '/api/resumes');
    } catch (error) {
      logError('Failed to fetch resumes', error as Error);
      throw error;
    }
  }

  async updateResumeTags(id: number, tags: string[]): Promise<Resume> {
    try {
      const tagsString = tags.join(',');
      return await this.request<Resume>('PATCH', `/api/resumes/${id}`, { tags: tagsString });
    } catch (error) {
      logError('Failed to update resume tags', error as Error, { resumeId: id });
      throw error;
    }
  }

  async deleteResume(id: number): Promise<void> {
    try {
      await this.request<void>('DELETE', `/api/resumes/${id}`);
    } catch (error) {
      logError('Failed to delete resume', error as Error, { resumeId: id });
      throw error;
    }
  }

  // =========================================================================
  // INTERVIEWS
  // =========================================================================
  async listInterviews(): Promise<Interview[]> {
    return this.request<Interview[]>('GET', '/api/interviews');
  }
  async createInterview(data: any): Promise<Interview> {
    return this.request<Interview>('POST', '/api/interviews', data);
  }
  async updateInterview(id: number, data: any): Promise<Interview> {
    return this.request<Interview>('PUT', `/api/interviews/${id}`, data);
  }
  async deleteInterview(id: number): Promise<void> {
    return this.request<void>('DELETE', `/api/interviews/${id}`);
  }

  // =========================================================================
  // OFFERS
  // =========================================================================
  async listOffers(): Promise<Offer[]> {
    return this.request<Offer[]>('GET', '/api/offers');
  }
  async createOffer(data: any): Promise<Offer> {
    return this.request<Offer>('POST', '/api/offers', data);
  }
  async updateOffer(id: number, data: any): Promise<Offer> {
    return this.request<Offer>('PUT', `/api/offers/${id}`, data);
  }
  async deleteOffer(id: number): Promise<void> {
    return this.request<void>('DELETE', `/api/offers/${id}`);
  }

  // =========================================================================
  // DEADLINES
  // =========================================================================
  async listDeadlines(): Promise<Deadline[]> {
    return this.request<Deadline[]>('GET', '/api/deadlines');
  }
  async createDeadline(data: any): Promise<Deadline> {
    return this.request<Deadline>('POST', '/api/deadlines', data);
  }
  async updateDeadline(id: number, data: any): Promise<Deadline> {
    return this.request<Deadline>('PUT', `/api/deadlines/${id}`, data);
  }
  async deleteDeadline(id: number): Promise<void> {
    return this.request<void>('DELETE', `/api/deadlines/${id}`);
  }

  // =========================================================================
  // UTIL
  // =========================================================================
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('GET', '/health');
  }

  getLogs() {
    return errorLogger.getLogs();
  }

  clearLogs() {
    errorLogger.clearLogs();
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const apiClient = new APIClient();
export default apiClient;
