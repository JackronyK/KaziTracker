/**
 * ============================================================================
 * FORMATTERS - utils/formatters.ts
 * ============================================================================
 * Date, number, and text formatting utilities (DD/MM/YYYY format)
 */

/**
 * Format date to DD/MM/YYYY format
 * @param date - Date object or ISO string
 * @returns Formatted date string (DD/MM/YYYY)
 */

export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date with time to DD/MM/YYYY HH:mm format
 * @param date - Date object or ISO string
 * @returns Formatted date and time string (DD/MM/YYYY HH:mm)
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return 'Invalid Date';
  }
};

/**
 * Calculate relative time (e.g., "2 days ago")
 * @param date - Date to compare with now
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }
    
    return formatDate(dateObj);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'unknown';
  }
};

/**
 * Format salary range (add commas)
 * @param salary - Salary string
 * @returns Formatted salary string
 */
export const formatSalary = (salary?: string | null): string => {
  if (!salary) return 'N/A';
  
  return salary.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format percentage
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (isNaN(value)) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format large numbers (e.g., 1000 -> 1K)
 * @param value - Number to format
 * @returns Formatted number string
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return String(value);
};

/**
 * Convert DD/MM/YYYY string to Date object
 * @param dateString - Date string in DD/MM/YYYY format
 * @returns Date object
 */
export const parseDateString = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};