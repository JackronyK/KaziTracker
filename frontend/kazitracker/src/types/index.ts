// src/types/index.ts
/**
 * ============================================================================
 * Complete TypeScript Type Definitions for KaziTracker
 * Production-Ready, Fully Aligned Types
 * ============================================================================
 */

// =============================================================================
// AUTH TYPES
// =============================================================================

/**
 * User entity from database
 */
export interface User {
  id?: number;
  email: string;
  created_at?: string;
  
  // Profile fields
  full_name?: string;
  phone_number?: string;
  location?: string;
  headline?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface ProfileUpdateRequest {
  full_name: string;
  phone_number?: string;
  location?: string;
  headline?: string;
}

export interface ProfileResponse extends User {
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// =============================================================================
// JOB TYPES - ALIGNED & COMPLETE
// =============================================================================

/**
 * Seniority level for jobs
 */
export type SeniorityLevel = 'entry' | 'mid' | 'senior';

/**
 * Job source - how the job was added
 */
export type JobSource = 'manual' | 'parsed' | 'imported';

/**
 * Job entity from database
 * Contains all fields including database-generated ones
 */
export interface Job {
  // Database fields
  id: number;
  user_id: number;
  created_at: string;
  updated_at?: string;
  
  // Core job details
  title: string;
  company: string;
  location?: string;
  salary_range?: string;
  description?: string;
  apply_url?: string;
  
  // Requirements & skills
  experience_required?: string;  // e.g., "3-5 years"
  tech_stack?: string[];           // Comma-separated: "python,react,aws"
  parsed_skills?: string;        // Comma-separated: "python,react,aws"
  
  // Classification
  seniority_level?: SeniorityLevel;
  source?: JobSource;
}

/**
 * Job input for creating/updating jobs
 * Excludes database-generated fields (id, user_id, timestamps)
 */
export interface JobInput {
  // Core job details (required)
  title: string;
  company: string;
  
  // Optional details
  location?: string;
  salary_range?: string;
  description?: string;
  apply_url?: string;
  
  // Requirements & skills
  experience_required?: string;
  tech_stack?: string;           // Comma-separated
  parsed_skills?: string;        // Comma-separated (from AI parser)
  
  // Classification
  seniority_level?: SeniorityLevel;
  source?: JobSource;
}

/**
 * Parsed job description result from AI/rules
 */
export interface ParsedJD {
  // Core details
  title: string;
  company: string;
  location?: string;
  salary_range?: string;
  description: string;
  apply_url?: string;
  
  // Extracted data
  skills: string[];              // Array format for easier manipulation
  seniority_level?: SeniorityLevel;
  
  // Metadata
  confidence: number;            // 0.0 - 1.0
  method?: 'ai' | 'rules';       // Which method was used
}

/**
 * Helper to convert ParsedJD to JobInput
 */
export const parsedJDToJobInput = (parsed: ParsedJD): JobInput => ({
  title: parsed.title,
  company: parsed.company,
  location: parsed.location,
  salary_range: parsed.salary_range,
  description: parsed.description,
  apply_url: parsed.apply_url,
  parsed_skills: parsed.skills.join(', '),
  tech_stack: parsed.skills.join(', '),
  seniority_level: parsed.seniority_level,
  source: 'parsed',
});


export interface EditJobFormData {
  title: string;
  company: string;
  location: string;
  salary_range: string;
  experience_required: string;
  seniority_level: string;
  tech_stack: string[]; // ← always array of strings
  description: string;
  application_link: string;
}

// =============================================================================
// APPLICATION TYPES
// =============================================================================

export type ApplicationStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected';

/**
 * Application entity from database
 */
export interface Application {
  // Database fields
  id: number;
  user_id: number;
  job_id: number;
  resume_id?: number;
  created_at: string;
  updated_at?: string;
  
  // Application details
  status: ApplicationStatus;
  notes?: string;
  
  // Status-specific fields
  applied_date?: string;
  interview_date?: string;
  interview_notes?: string;
  offer_date?: string;
  salary_offered?: string;
  rejected_date?: string;
  reason_for_rejection?: string;
  
  // Joined data (populated from API)
  job?: Job;
  resume?: Resume;
}

/**
 * Application input for creating applications
 */
export interface ApplicationInput {
  job_id: number;
  resume_id?: number;
  status?: ApplicationStatus;
  notes?: string;
  applied_date?: string;
  interview_date?: string;
}

/**
 * Application update for partial updates
 */
export interface ApplicationUpdate {
  status?: ApplicationStatus;
  notes?: string;
  applied_date?: string;
  interview_date?: string;
  interview_notes?: string;
  offer_date?: string;
  salary_offered?: string;
  rejected_date?: string;
  reason_for_rejection?: string;
}

// =============================================================================
// RESUME TYPES
// =============================================================================

export type ResumeFileType = 'pdf' | 'docx';

/**
 * Resume entity from database
 */
export interface Resume {
  // Database fields
  id: number;
  user_id: number;
  created_at: string;
  updated_at?: string;
  
  // File details
  filename: string;
  file_path: string;
  file_size?: number;
  file_type: ResumeFileType;
  url: string;
  
  // Extracted content
  extracted_text?: string;
  
  // Organization
  tags?: string;  // Comma-separated: "senior,fullstack,updated-2024"
}

/**
 * Resume upload input
 */
export interface ResumeUploadInput {
  file: File;
  tags?: string;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export type DateRangeType = 'day' | 'week' | 'month' | 'year' | 'all';

export interface AnalyticsFilter {
  range: DateRangeType;
  startDate?: Date;
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
  interview_rate: number;
  offer_rate: number;
  expired_deadlines: number;
}

export interface AnalyticsData {
  stats: ApplicationStats;
  timeline: TimelineEntry[];
  resume_performance: ResumePerformance[];
  recent_activity: ActivityLog[];
}

export interface TimelineEntry {
  date: string;
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
  parseJD: (rawJd: string, url?: string, useLLM?: boolean) => Promise<ParsedJD | null>;
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

export interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchUser: () => Promise<void>;
  updateProfile: (profile: ProfileUpdateRequest) => Promise<User | null>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

export interface UseNavigationReturn {
  activeTab: NavTab | null;
  loading: boolean;
  
  // Actions
  navigateTo: (tab: NavTab) => void;
  goBack: () => void;
  getCurrentTab: () => NavTab | null;
  isTabActive: (tab: NavTab) => boolean;
}

// =============================================================================
// NAVIGATION TYPES
// =============================================================================

export type NavTab = 
  | 'dashboard' 
  | 'jobs' 
  | 'applications' 
  | 'resumes' 
  | 'premium'
  | 'profile'
  | 'settings';

export interface NavigationState {
  currentTab: NavTab;
  previousTab: NavTab | null;
  history: NavTab[];
}

// =============================================================================
// ERROR LOGGING TYPES
// =============================================================================

export interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
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

// =============================================================================
// TYPE GUARDS & VALIDATORS
// =============================================================================

/**
 * Check if a value is a valid ApplicationStatus
 */
export const isApplicationStatus = (value: any): value is ApplicationStatus => {
  return ['saved', 'applied', 'interview', 'offer', 'rejected'].includes(value);
};

/**
 * Check if a value is a valid SeniorityLevel
 */
export const isSeniorityLevel = (value: any): value is SeniorityLevel => {
  return ['entry', 'mid', 'senior'].includes(value);
};

/**
 * Check if a value is a valid NavTab
 */
export const isNavTab = (value: any): value is NavTab => {
  return ['dashboard', 'jobs', 'applications', 'resumes', 'premium', 'profile', 'settings'].includes(value);
};

/**
 * Validate job input
 */
export const validateJobInput = (input: Partial<JobInput>): string[] => {
  const errors: string[] = [];
  
  if (!input.title?.trim()) {
    errors.push('Title is required');
  }
  if (!input.company?.trim()) {
    errors.push('Company is required');
  }
  if (input.title && input.title.length > 200) {
    errors.push('Title is too long (max 200 characters)');
  }
  if (input.company && input.company.length > 200) {
    errors.push('Company name is too long (max 200 characters)');
  }
  if (input.seniority_level && !isSeniorityLevel(input.seniority_level)) {
    errors.push('Invalid seniority level');
  }
  
  return errors;
};

/**
 * Validate application input
 */
export const validateApplicationInput = (input: Partial<ApplicationInput>): string[] => {
  const errors: string[] = [];
  
  if (!input.job_id || input.job_id <= 0) {
    errors.push('Valid job ID is required');
  }
  if (input.status && !isApplicationStatus(input.status)) {
    errors.push('Invalid application status');
  }
  
  return errors;
};

// =============================================================================
// CONSTANTS
// =============================================================================

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'saved',
  'applied',
  'interview',
  'offer',
  'rejected',
];

export const SENIORITY_LEVELS: SeniorityLevel[] = ['entry', 'mid', 'senior'];

export const JOB_SOURCES: JobSource[] = ['manual', 'parsed', 'imported'];

export const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
  entry: 'Entry Level',
  mid: 'Mid Level',
  senior: 'Senior Level',
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: 'gray',
  applied: 'blue',
  interview: 'yellow',
  offer: 'green',
  rejected: 'red',
};