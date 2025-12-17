// src/types/index.ts
/**
 * Complete TypeScript Type Definitions for KaziTracker
 * This file contains all interfaces and types used throughout the app
 **/

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface User {
    email: string;
    id?: number;
    created_at?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

// =============================================================================
// JOB TYPES
// =============================================================================
export interface Job {
    id: number;
    user_id: number;
    title: string;
    company: string;
    location?: string;
    salary_range?: string;
    description?: string;
    apply_url?: string;
    parsed_skills?: string; //comma-separated
    seniority_levels?: 'entry' | 'mid' | 'senior';
    source?: string;
    created_at?: string;
    updated_at?: string;
}

export interface JobInput {
    title: string;
    company: string;
    location?: string;
    salary_range?: string;
    apply_url?: string;
    parsed_skills?: string;
    seniority_levels?: 'entry' | 'mid' | 'senior';
    source?: string;
}

export interface ParsedJD {
    title: string;
    company: string;
    location?: string;
    salary_range?: string;
    seniority_levels?: 'entry' | 'mid' | 'senior';
    skills: string[];
    description: string;
    apply_url?: string;
    confidence: number;
}

// =============================================================================
// APPLICATION TYPES
// =============================================================================
export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

export interface Application {
    id: number;
    user_id: number;
    resume_id?: number;
    status: ApplicationStatus;
    notes?: string;
  applied_date?: string; // When they applied
  interview_date?: string; // Interview scheduled date
  interview_notes?: string; // Notes from interview
  salary_offered?: string; // For offer status
  reason_for_rejection?: string; // For rejected status
  created_at: string;
  updated_at?: string;
  
  // For UI display (populated from joins)
  job?: Job;
  resume?: Resume;
}

export interface ApplicationInput {
  job_id: number;
  resume_id?: number;
  status?: ApplicationStatus;
  notes?: string;
  applied_date?: string;
  interview_date?: string;
}

export interface ApplicationUpdate {
    status?: ApplicationStatus;
    notes?: string;
    applied_date?: string;
    interview_date?: string;
    interview_notes?: string;
    salary_offered?: string;
    reason_for_rejection?: string; 
}

// =============================================================================
// RESUME TYPES
// =============================================================================

export interface Resume {
    id: number;
    user_id: number;
    filename: string;
    file_path: string;
    file_type: 'pdf' | 'docx';
    extracted_text?: string;
    tags?: string; // comma-separated tags like 'senior' 'python
    created_at: string;
    updated_at?: string;
}

export interface ResumeUploadInput {
    file: File;
    tag?: string;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export type DateRangeType = 'day' | 'week' | 'month' | 'year' | 'all'

export interface AnalyticsFilter {
    range: DateRangeType;
    startData?: Date;
    endDate?: Date;
}

export interface ApplicationStats {
  total: number;
  by_status: {
    saved: number;
    applied: number;
    interview: number;
    offer: number;
    rejected: number;
  };
  last_30_days: number;
  interview_rate: number; // percentage
  offer_rate: number; // percentage
  expired_deadlines: number; // passed deadlines
}

export interface AnalyticsData {
  stats: ApplicationStats;
  timeline: TimelineEntry[]; // for charts
  resume_performance: ResumePerformance[];
  recent_activity: ActivityLog[];
}

export interface TimelineEntry {
  date: string; // DD/MM/YYYY
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

export interface ResumePerformance {
  resume_id: number;
  filename: string;
  total_used: number;
  interviews_received: number;
  offers_received: number;
  interview_rate: number;
  offer_rate: number;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: 'application_created' | 'status_changed' | 'resume_uploaded' | 'job_added';
  details: string;
  created_at: string;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  detail: string;
  message?: string;
  status?: number;
}

// =============================================================================
// HOOK RETURN TYPES
// =============================================================================

export interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchJobs: () => Promise<void>;
  createJob: (job: JobInput) => Promise<Job | null>;
  updateJob: (id: number, job: Partial<JobInput>) => Promise<Job | null>;
  deleteJob: (id: number) => Promise<boolean>;
  getJob: (id: number) => Promise<Job | null>;
  parseJD: (rawJd: string, url?: string) => Promise<ParsedJD | null>;
}

export interface UseApplicationsReturn {
  applications: Application[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchApplications: () => Promise<void>;
  createApplication: (app: ApplicationInput) => Promise<Application | null>;
  updateApplication: (id: number, app: ApplicationUpdate) => Promise<Application | null>;
  deleteApplication: (id: number) => Promise<boolean>;
  getApplication: (id: number) => Promise<Application | null>;
}

export interface UseResumesReturn {
  resumes: Resume[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchResumes: () => Promise<void>;
  uploadResume: (file: File, tags?: string) => Promise<Resume | null>;
  deleteResume: (id: number) => Promise<boolean>;
  updateResumeTags: (id: number, tags: string) => Promise<Resume | null>;
}

export interface UseAnalyticsReturn {
  stats: ApplicationStats | null;
  timeline: TimelineEntry[];
  resumePerformance: ResumePerformance[];
  recentActivity: ActivityLog[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAnalytics: (filter: AnalyticsFilter) => Promise<void>;
  getStatsByRange: (range: DateRangeType) => Promise<ApplicationStats | null>;
}

// =============================================================================
// ERROR LOGGING TYPES
// =============================================================================

export interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  timestamp: string; // DD/MM/YYYY HH:mm:ss
  url?: string;
  stackTrace?: string;
}

export interface ErrorContextInfo {
  component?: string;
  action?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  [key: string]: any;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface DashboardCard {
  title: string;
  value: number | string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}
