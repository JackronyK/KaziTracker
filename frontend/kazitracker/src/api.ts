/**
 * Enhanced API Client with Comprehensive Error Logging
 * Features: JWT auth, error handling, request/response logging, retry logic
 */

import type {
  LoginRequest,
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
} from './types';
import { API_URL, ERROR_MESSAGES, API_TIMEOUT } from './utils/constants';
import { logError, logInfo, logWarn, errorLogger } from './utils/errorLogger';

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

  /**
   * Set JWT token
   */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
    logInfo('Token set successfully');
  }

  /**
   * Get token from storage
   */
  private getStoredToken(): string | null {
    const token = localStorage.getItem('token');
    return token || null;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token || this.getStoredToken();
  }

  /**
   * Clear token and logout
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    logInfo('Token cleared - user logged out');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // =========================================================================
  // REQUEST HANDLING
  // =========================================================================

  /**
   * Make API request with error handling
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    isFormData: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {};

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add content type (unless FormData)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    };

    logInfo(`API Request: ${method} ${endpoint}`);

    try {
      // Set timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data = await response.json().catch(() => null);

      // Handle errors
      if (!response.ok) {
        const error = data as ApiError;
        const errorMessage = error.detail || error.message || ERROR_MESSAGES.UNEXPECTED_ERROR;
        
        // Log error
        logError(`API Error: ${method} ${endpoint}`, undefined, {
          status: response.status,
          message: errorMessage,
          endpoint,
        });

        // Handle specific status codes
        if (response.status === 401) {
          this.clearToken();
        }

        throw new Error(errorMessage);
      }

      logInfo(`API Success: ${method} ${endpoint}`, { status: response.status });
      return data as T;
    } catch (error) {
      // Handle different error types
      if (error instanceof TypeError) {
        logError('Network Error', error, { endpoint, method });
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }

      if (error instanceof SyntaxError) {
        logError('Invalid Response Format', error, { endpoint, method });
        throw new Error('Invalid response from server');
      }

      // Re-throw other errors
      logError(`Request Failed: ${method} ${endpoint}`, error as Error);
      throw error;
    }
  }

  // =========================================================================
  // AUTH ENDPOINTS
  // =========================================================================

  /**
   * Sign up new user
   */
  async signup(email: string, password: string): Promise<TokenResponse> {
    try {
      logInfo('Signup attempt', { email });
      const response = await this.request<TokenResponse>('POST', '/api/auth/signup', {
        email,
        password,
      });
      this.setToken(response.access_token);
      return response;
    } catch (error) {
      logError('Signup failed', error as Error, { email });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<TokenResponse> {
    try {
      logInfo('Login attempt', { email });
      const response = await this.request<TokenResponse>('POST', '/api/auth/login', {
        email,
        password,
      });
      this.setToken(response.access_token);
      return response;
    } catch (error) {
      logError('Login failed', error as Error, { email });
      throw error;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    try {
      return await this.request<User>('GET', '/api/auth/me');
    } catch (error) {
      logError('Failed to fetch current user', error as Error);
      throw error;
    }
  }

  // =========================================================================
  // JOB ENDPOINTS
  // =========================================================================

  /**
   * Create new job
   */
  async createJob(job: JobInput): Promise<Job> {
    try {
      logInfo('Creating job', { company: job.company, title: job.title });
      return await this.request<Job>('POST', '/api/jobs', job);
    } catch (error) {
      logError('Failed to create job', error as Error);
      throw error;
    }
  }

  /**
   * Get all jobs
   */
  async listJobs(): Promise<Job[]> {
    try {
      return await this.request<Job[]>('GET', '/api/jobs');
    } catch (error) {
      logError('Failed to fetch jobs', error as Error);
      throw error;
    }
  }

  /**
   * Get single job
   */
  async getJob(id: number): Promise<Job> {
    try {
      return await this.request<Job>('GET', `/api/jobs/${id}`);
    } catch (error) {
      logError('Failed to fetch job', error as Error, { jobId: id });
      throw error;
    }
  }

  /**
   * Update job
   */
  async updateJob(id: number, job: Partial<JobInput>): Promise<Job> {
    try {
      logInfo('Updating job', { jobId: id });
      return await this.request<Job>('PATCH', `/api/jobs/${id}`, job);
    } catch (error) {
      logError('Failed to update job', error as Error, { jobId: id });
      throw error;
    }
  }

  /**
   * Delete job
   */
  async deleteJob(id: number): Promise<void> {
    try {
      logInfo('Deleting job', { jobId: id });
      await this.request<void>('DELETE', `/api/jobs/${id}`);
    } catch (error) {
      logError('Failed to delete job', error as Error, { jobId: id });
      throw error;
    }
  }

  // =========================================================================
  // PARSER ENDPOINT
  // =========================================================================

  /**
   * Parse job description
   */
  async parseJD(
    rawJd: string,
    url?: string,
    useLLM: boolean = false
  ): Promise<ParsedJD> {
    try {
      logInfo('Parsing job description', { useLLM, hasUrl: !!url });
      return await this.request<ParsedJD>('POST', '/api/parse/jd', {
        raw_jd: rawJd,
        url,
        use_llm: useLLM,
      });
    } catch (error) {
      logError('Failed to parse job description', error as Error);
      throw error;
    }
  }

  // =========================================================================
  // APPLICATION ENDPOINTS (PHASE 4)
  // =========================================================================

  /**
   * Create application
   */
  async createApplication(app: ApplicationInput): Promise<Application> {
    try {
      logInfo('Creating application', { jobId: app.job_id });
      return await this.request<Application>('POST', '/api/applications', app);
    } catch (error) {
      logError('Failed to create application', error as Error);
      throw error;
    }
  }

  /**
   * Get all applications
   */
  async listApplications(): Promise<Application[]> {
    try {
      return await this.request<Application[]>('GET', '/api/applications');
    } catch (error) {
      logError('Failed to fetch applications', error as Error);
      throw error;
    }
  }

  /**
   * Get single application
   */
  async getApplication(id: number): Promise<Application> {
    try {
      return await this.request<Application>('GET', `/api/applications/${id}`);
    } catch (error) {
      logError('Failed to fetch application', error as Error, { appId: id });
      throw error;
    }
  }

  /**
   * Update application (all fields)
   */
  async updateApplication(id: number, app: ApplicationUpdate): Promise<Application> {
    try {
      logInfo('Updating application', { appId: id, newStatus: app.status });
      return await this.request<Application>('PATCH', `/api/applications/${id}`, app);
    } catch (error) {
      logError('Failed to update application', error as Error, { appId: id });
      throw error;
    }
  }

  /**
   * Update application status
   * Convenience method that calls updateApplication with just status
   */
  async updateApplicationStatus(
    id: number,
    status: string,
    dates?: {
      applied_date?: string;
      interview_date?: string;
      offer_date?: string;
      rejected_date?: string;
    }
  ): Promise<Application> {
    try {
      logInfo('Updating application status', { appId: id, newStatus: status });
      const update: ApplicationUpdate = { status, ...dates };
      return await this.request<Application>('PATCH', `/api/applications/${id}`, update);
    } catch (error) {
      logError('Failed to update application status', error as Error, { appId: id });
      throw error;
    }
  }

  /**
   * Delete application
   */
  async deleteApplication(id: number): Promise<void> {
    try {
      logInfo('Deleting application', { appId: id });
      await this.request<void>('DELETE', `/api/applications/${id}`);
    } catch (error) {
      logError('Failed to delete application', error as Error, { appId: id });
      throw error;
    }
  }

  // =========================================================================
  // RESUME ENDPOINTS (PHASE 5)
  // =========================================================================

  /**
   * Upload resume
   */
  async uploadResume(file: File, tags?: string): Promise<Resume> {
    try {
      logInfo('Uploading resume', { filename: file.name, size: file.size });

      const formData = new FormData();
      formData.append('file', file);
      if (tags) {
        formData.append('tags', tags);
      }

      return await this.request<Resume>('POST', '/api/resumes/upload', formData, true);
    } catch (error) {
      logError('Failed to upload resume', error as Error, { filename: file.name });
      throw error;
    }
  }

  /**
   * Get all resumes
   */
  async listResumes(): Promise<Resume[]> {
    try {
      return await this.request<Resume[]>('GET', '/api/resumes');
    } catch (error) {
      logError('Failed to fetch resumes', error as Error);
      throw error;
    }
  }

  /**
   * Update resume tags
   */
  async updateResumeTags(id: number, tags: string[]): Promise<Resume> {
    try {
      logInfo('Updating resume tags', { resumeId: id, tagCount: tags.length });
      const tagsString = tags.join(',');
      return await this.request<Resume>('PATCH', `/api/resumes/${id}`, {
        tags: tagsString,
      });
    } catch (error) {
      logError('Failed to update resume tags', error as Error, { resumeId: id });
      throw error;
    }
  }

  /**
   * Delete resume
   */
  async deleteResume(id: number): Promise<void> {
    try {
      logInfo('Deleting resume', { resumeId: id });
      await this.request<void>('DELETE', `/api/resumes/${id}`);
    } catch (error) {
      logError('Failed to delete resume', error as Error, { resumeId: id });
      throw error;
    }
  }

  // =========================================================================
  // UTILITY ENDPOINTS
  // =========================================================================

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    try {
      return await this.request<{ status: string }>('GET', '/health');
    } catch (error) {
      logError('Health check failed', error as Error);
      throw error;
    }
  }

  // =========================================================================
  // DEBUG UTILITIES
  // =========================================================================

  /**
   * Get all logs (for debugging)
   */
  getLogs() {
    return errorLogger.getLogs();
  }

  /**
   * Clear logs
   */
  clearLogs() {
    errorLogger.clearLogs();
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const apiClient = new APIClient();