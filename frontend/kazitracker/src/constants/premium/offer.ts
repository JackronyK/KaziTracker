// src/constants/premium/offer.ts
/**
 * Shared Offer Constants & Types
 * Used across OfferTracker, OfferModal, UpdateStatusModal
 * 
 * Single source of truth for all offer-related options
 * Easy to update across entire app
 */

// ============================================================================
// CURRENCY OPTIONS
// ============================================================================
export const CURRENCIES = [
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]['code'];

// ============================================================================
// SALARY FREQUENCY OPTIONS
// ============================================================================
export const SALARY_FREQUENCIES = [
  { value: 'hourly', label: '⏰ Per Hour' },
  { value: 'weekly', label: '📅 Per Week' },
  { value: 'monthly', label: '📅 Per Month' },
  { value: 'annual', label: '📊 Per Year' },
] as const;

export type SalaryFrequency = typeof SALARY_FREQUENCIES[number]['value'];

// ============================================================================
// POSITION TYPE OPTIONS
// ============================================================================
export const POSITION_TYPES = [
  { value: 'Full-time', label: '💼 Full-time' },
  { value: 'Part-time', label: '⏰ Part-time' },
  { value: 'Contract', label: '📋 Contract' },
  { value: 'Freelance', label: '🎨 Freelance' },
  { value: 'Internship', label: '📚 Internship' },
  { value: 'Temporary', label: '⏳ Temporary' },
] as const;

export type PositionType = typeof POSITION_TYPES[number]['value'];

// ============================================================================
// LOCATION TYPE OPTIONS
// ============================================================================
export const LOCATION_TYPES = [
  { value: 'On-site', label: '🏢 On-site' },
  { value: 'Remote', label: '🏠 Remote' },
  { value: 'Hybrid', label: '🔄 Hybrid' },
] as const;

export type LocationType = typeof LOCATION_TYPES[number]['value'];

// ============================================================================
// BENEFIT OPTIONS (Preset)
// ============================================================================
export const BENEFIT_OPTIONS = [
  { value: 'Health insurance', label: '🏥 Health Insurance' },
  { value: '401k', label: '💳 401k' },
  { value: 'Pension', label: '💰 Pension' },
  { value: 'Dental', label: '🦷 Dental' },
  { value: 'Vision', label: '👀 Vision' },
  { value: 'Life insurance', label: '🛡️ Life Insurance' },
  { value: 'Stock options', label: '📈 Stock Options' },
  { value: 'Bonus', label: '💰 Bonus' },
  { value: 'Paid time off', label: '✈️ Paid Time Off' },
  { value: 'Remote work', label: '🏠 Remote Work' },
  { value: 'Professional development', label: '🎓 Professional Development' },
  { value: 'Gym membership', label: '🏋️ Gym Membership' },
  { value: 'Free lunch', label: '🍽️ Free Lunch' },
  { value: 'Relocation assistance', label: '🚚 Relocation Assistance' },
  { value: 'Flexible hours', label: '⏱️ Flexible Hours' },
] as const;

export type BenefitOption = typeof BENEFIT_OPTIONS[number]['value'];

// ============================================================================
// OFFER STATUS OPTIONS
// ============================================================================
export const OFFER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'blue' },
  { value: 'negotiating', label: 'Negotiating', color: 'orange' },
  { value: 'accepted', label: 'Accepted', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
] as const;

export type OfferStatus = typeof OFFER_STATUSES[number]['value'];

// ============================================================================
// APPLICATION STATUS OPTIONS
// ============================================================================
export const APPLICATION_STATUSES = [
  { value: 'saved', label: 'Saved', emoji: '📌' },
  { value: 'applied', label: 'Applied', emoji: '📤' },
  { value: 'interview', label: 'Interview', emoji: '🎯' },
  { value: 'offer', label: 'Offer', emoji: '🎉' },
  { value: 'rejected', label: 'Rejected', emoji: '❌' },
] as const;

export type ApplicationStatus = typeof APPLICATION_STATUSES[number]['value'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get currency symbol by code
 */
export const getCurrencySymbol = (code: string): string => {
  return CURRENCIES.find(c => c.code === code)?.symbol || code;
};

/**
 * Get currency name by code
 */
export const getCurrencyName = (code: string): string => {
  return CURRENCIES.find(c => c.code === code)?.name || code;
};

/**
 * Format salary with currency and frequency
 */
export const formatSalary = (
  amount: string | number,
  currency: string,
  frequency: string
): string => {
  if (!amount || Number(amount) === 0) return '';
  
  const symbol = getCurrencySymbol(currency || 'KES');
  const num = Number(amount);
  const formatted = num.toLocaleString();
  
  let freqLabel = '';
  switch (frequency) {
    case 'hourly':
      freqLabel = '/hour';
      break;
    case 'weekly':
      freqLabel = '/week';
      break;
    case 'monthly':
      freqLabel = '/month';
      break;
    case 'annual':
      freqLabel = '/year';
      break;
    default:
      freqLabel = '';
  }
  
  return `${symbol} ${formatted}${freqLabel}`;
};

/**
 * Get status color for UI display
 */
export const getStatusColor = (status: OfferStatus): string => {
  const statusOption = OFFER_STATUSES.find(s => s.value === status);
  return statusOption?.color || 'gray';
};

/**
 * Get application status color
 */
export const getApplicationStatusColor = (status: ApplicationStatus): string => {
  switch (status) {
    case 'saved':
      return 'text-gray-600';
    case 'applied':
      return 'text-blue-600';
    case 'interview':
      return 'text-purple-600';
    case 'offer':
      return 'text-green-600';
    case 'rejected':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export interface OfferFormData {
  application_id: number;
  company_name: string;
  position: string;
  salary: number;
  currency: CurrencyCode;
  salary_frequency: SalaryFrequency;
  position_type?: PositionType;
  location?: LocationType;
  benefits: BenefitOption[];
  start_date: string;
  deadline: string;
  status: OfferStatus;
  notes: string;
}

export interface OfferDetails {
  salary?: string | number;
  currency?: CurrencyCode;
  salary_frequency?: SalaryFrequency;
  position_type?: PositionType;
  location?: LocationType;
  start_date?: string;
  offer_deadline?: string;
  benefits?: string[];
  notes?: string;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate salary amount
 */
export const isValidSalary = (salary: number | string): boolean => {
  const num = Number(salary);
  return num > 0 && isFinite(num);
};

/**
 * Validate required offer fields
 */
export const validateOfferForm = (data: Partial<OfferFormData>): string | null => {
  if (!data.application_id) return 'Application is required';
  if (!data.company_name?.trim()) return 'Company name is required';
  if (!data.position?.trim()) return 'Position is required';
  if (!isValidSalary(data.salary || 0)) return 'Valid salary is required';
  if (!data.start_date) return 'Start date is required';
  if (!data.deadline) return 'Response deadline is required';
  
  return null;
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================
/*
// In components:

import {
  CURRENCIES,
  SALARY_FREQUENCIES,
  POSITION_TYPES,
  LOCATION_TYPES,
  BENEFIT_OPTIONS,
  formatSalary,
  getCurrencySymbol,
  validateOfferForm,
} from '@/constants/offer';

// Use in JSX:
<select>
  {CURRENCIES.map(curr => (
    <option key={curr.code} value={curr.code}>
      {curr.code} ({curr.symbol})
    </option>
  ))}
</select>

// Format salary:
formatSalary(150000, 'KES', 'monthly') // 'KSh 150,000/month'

// Validate form:
const error = validateOfferForm(formData);
if (error) {
  toast.error('Validation Error', error);
}
*/