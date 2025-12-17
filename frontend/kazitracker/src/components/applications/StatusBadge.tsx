// src/components/applications/StatusBadge.tsx
/**
 * StatusBadge Component
 * Displays application status with color coding
 */

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * StatusBadge Component
 * 
 * Props:
 * - status: Application status (Saved, Applied, Interview, Offer, Rejected)
 * - size: Badge size (sm, md, lg)
 * 
 * Features:
 * - Color-coded by status
 * - Consistent styling
 * - Size variants
 */
export const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  // Get status styling
  const getStatusStyle = (
    s: string
  ): { bg: string; text: string; icon: string } => {
    switch (s.toLowerCase()) {
      case 'saved':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: '📌',
        };
      case 'applied':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: '📤',
        };
      case 'interview':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-800',
          icon: '🎯',
        };
      case 'offer':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: '🎉',
        };
      case 'rejected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: '❌',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: '•',
        };
    }
  };

  const style = getStatusStyle(status);

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${style.bg} ${style.text} ${sizeClasses[size]}`}
    >
      <span>{style.icon}</span>
      {status}
    </span>
  );
};

export default StatusBadge;