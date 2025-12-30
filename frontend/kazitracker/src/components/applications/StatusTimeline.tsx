// src/components/application/StatusTimeline.tsx
/**
 * StatusTimeline Component
 * Visual timeline of application status progression
 */

import type { Application } from '../../types/index';
import { formatDate } from '../../utils/formatters';

interface StatusTimelineProps {
  application: Application;
}

/**
 * StatusTimeline Component
 * 
 * Props:
 * - application: Application object with status and dates
 * 
 * Features:
 * - Visual timeline of status changes
 * - Shows all status dates
 * - Color-coded milestones
 * - Professional styling
 */
export const StatusTimeline = ({ application }: StatusTimelineProps) => {
  // Timeline events
  const events = [
    {
      status: 'Saved',
      date: application.created_at,
      icon: '📌',
      color: 'bg-gray-400',
      description: 'Job added to tracker',
    },
    {
      status: 'Applied',
      date: application.applied_date,
      icon: '📤',
      color: 'bg-blue-400',
      description: 'Resume submitted',
    },
    {
      status: 'Interview',
      date: application.interview_date,
      icon: '🎯',
      color: 'bg-purple-400',
      description: 'Interview scheduled',
    },
    {
      status: 'Offer',
      date: application.offer_date,
      icon: '🎉',
      color: 'bg-green-400',
      description: 'Offer received',
    },
    {
      status: 'Rejected',
      date: application.rejected_date,
      icon: '❌',
      color: 'bg-red-400',
      description: 'Application rejected',
    },
  ];

  // Filter to only events with dates
  const completedEvents = events.filter((e) => e.date);

  if (completedEvents.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">
        Application Timeline
      </h4>

      <div className="relative">
        {/* Timeline line */}
        {completedEvents.length > 1 && (
          <div className="absolute left-4 top-8 bottom-0 w-1 bg-gradient-to-b from-blue-300 to-green-300"></div>
        )}

        {/* Events */}
        <div className="space-y-4 relative z-10">
          {completedEvents.map((event, idx) => (
            <div key={idx} className="flex gap-4">
              {/* Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${event.color} shadow`}
              >
                {event.icon}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <p className="font-semibold text-gray-900">{event.status}</p>
                <p className="text-sm text-gray-600">{event.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(event.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;