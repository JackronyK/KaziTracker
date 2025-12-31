// src/components/Dashboard/ApplicationTimeline.tsx
/**
 * ApplicationTimeline Component
 * Displays recent application activity
 */

import type { Application } from '../../types';
import { formatDate } from '../../utils/formatters';

interface ApplicationTimelineProps {
  applications: Application[];
  limit?: number;
}

/**
 * ApplicationTimeline Component
 * 
 * Props:
 * - applications: Array of applications to display
 * - limit: Number of items to show (default: 10)
 * 
 * Features:
 * - Recent activity timeline
 * - Color-coded by status
 * - Shows company and status
 * - Displays date
 * - Limited to recent items
 */
export const ApplicationTimeline = ({
  applications,
  limit = 10,
}: ApplicationTimelineProps) => {
  // Sort by created_at descending (most recent first)
  const recentApps = [...applications]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);

  // Get status color and icon
  const getStatusStyle = (
    status: string
  ): { color: string; bg: string; icon: string } => {
    switch (status.toLowerCase()) {
      case 'saved':
        return { color: 'text-gray-700', bg: 'bg-gray-100', icon: '📌' };
      case 'applied':
        return { color: 'text-blue-700', bg: 'bg-blue-100', icon: '📤' };
      case 'interview':
        return { color: 'text-purple-700', bg: 'bg-purple-100', icon: '🎯' };
      case 'offer':
        return { color: 'text-green-700', bg: 'bg-green-100', icon: '🎉' };
      case 'rejected':
        return { color: 'text-red-700', bg: 'bg-red-100', icon: '❌' };
      default:
        return { color: 'text-gray-700', bg: 'bg-gray-100', icon: '•' };
    }
  };

  if (recentApps.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No recent applications</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>

      <div className="space-y-3">
        {recentApps.map((app) => {
          const style = getStatusStyle(app.status);

          return (
            <div
              key={app.id}
              className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition"
            >
              {/* Icon */}
              <div className={`${style.bg} rounded-full p-2 text-lg flex-shrink-0`}>
                {style.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900 truncate">
                    {app.job?.company|| app.company_name || 'Unknown Company'}
                  </p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${style.bg} ${style.color}`}
                  >
                    {app.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {app.job?.title || 'Job Title'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(app.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {applications.length > limit && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Showing {limit} of {applications.length} applications
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplicationTimeline;