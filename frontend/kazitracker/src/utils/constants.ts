/**
 * ============================================================================
 * CONSTANTS - utils/constants.ts
 * ============================================================================
 * Application-wide constants and enums
 */
// Application Status Options
export const APPLICATION_STATUSES = {
  SAVED: 'saved',
  APPLIED: 'applied',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  REJECTED: 'rejected',
} as const;

// Status Labels (for UI display)
export const STATUS_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
} as const;

// Status Colors (for styling)
export const STATUS_COLORS = {
  saved: 'gray',
  applied: 'blue',
  interview: 'purple',
  offer: 'green',
  rejected: 'red',
} as const;

// Seniority Levels
export const SENIORITY_LEVELS = {
  ENTRY: 'entry',
  MID: 'mid',
  SENIOR: 'senior',
} as const;

export const SENIORITY_LABELS = {
  entry: 'Entry Level',
  mid: 'Mid Level',
  senior: 'Senior Level',
} as const;

// File Types
export const ALLOWED_FILE_TYPES = ['pdf', 'docx'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_TIMEOUT = 30000; // 30 seconds

// Date Range Options for Analytics
export const DATE_RANGES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all',
} as const;

export const DATE_RANGE_LABELS = {
  day: 'Last 24 Hours',
  week: 'Last 7 Days',
  month: 'Last 30 Days',
  year: 'Last 365 Days',
  all: 'All Time',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'kazi_token',
  USER: 'kazi_user',
  THEME: 'kazi_theme',
  PREFERENCES: 'kazi_preferences',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_EXISTS: 'User already exists.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FILE_TOO_LARGE: 'File is too large. Maximum size is 5MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Only PDF and DOCX are allowed.',
  PARSING_FAILED: 'Failed to parse job description.',
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;