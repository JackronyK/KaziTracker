// src/components/applications/ApplicationCard.tsx
/**
 * ApplicationCard Component
 * Displays individual application with status and actions
 */

import { Edit2, Trash2, Calendar, Building2 } from 'lucide-react';
import type { Application, Job } from '../../types/index';
import { formatDate } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface ApplicationCardProps {
  application: Application;
  onStatusChange: (app: Application) => void;
  onDelete: (id: number) => void;
  jobDetails?: Job; // Optional job details
}

/**
 * ApplicationCard Component
 * 
 * Props:
 * - application: Application object to display
 * - onStatusChange: Callback when update status clicked
 * - onDelete: Callback when delete clicked
 * - jobDetails: Optional job details for additional info
 * 
 * Features:
 * - Job title and company
 * - Application status with color coding
 * - Applied date
 * - Interview date (if scheduled)
 * - Status change and delete buttons
 * - Hover effects
 */
export const ApplicationCard = ({
  application,
  onStatusChange,
  onDelete,
  jobDetails,
}: ApplicationCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header: Job Info and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {jobDetails?.title || application.job_title || 'Job Position'}
          </h3>
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            {jobDetails?.company || application.company_name || 'Company'}
          </div>
        </div>

        {/* Status Badge */}
        <div className="ml-2">
          <StatusBadge status={application.status} />
        </div>
      </div>

      {/* Key Dates */}
      <div className="space-y-2 mb-4">
        {/* Created/Applied Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          {application.applied_date
            ? `Applied: ${formatDate(application.applied_date)}`
            : `Added: ${formatDate(application.created_at)}`}
        </div>

        {/* Interview Date if scheduled */}
        {application.interview_date && (
          <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
            <Calendar className="w-4 h-4" />
            Interview: {formatDate(application.interview_date)}
          </div>
        )}

        {/* Offer Date if received */}
        {application.offer_date && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <Calendar className="w-4 h-4" />
            Offer: {formatDate(application.offer_date)}
          </div>
        )}
      </div>

      {/* Notes Preview */}
      {application.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded line-clamp-2">
            💬 {application.notes}
          </p>
        </div>
      )}

      {/* Status Progress Bar */}
      <div className="mb-4">
        <div className="flex gap-1 h-1">
          {/* Saved indicator */}
          <div className="flex-1 bg-gray-300 rounded-full"></div>

          {/* Applied indicator */}
          <div
            className={`flex-1 rounded-full ${
              ['Applied', 'Interview', 'Offer', 'Rejected'].includes(
                application.status
              )
                ? 'bg-blue-400'
                : 'bg-gray-200'
            }`}
          ></div>

          {/* Interview indicator */}
          <div
            className={`flex-1 rounded-full ${
              ['Interview', 'Offer', 'Rejected'].includes(application.status)
                ? 'bg-purple-400'
                : 'bg-gray-200'
            }`}
          ></div>

          {/* Final indicator */}
          <div
            className={`flex-1 rounded-full ${
              application.status === 'Offer'
                ? 'bg-green-400'
                : application.status === 'Rejected'
                  ? 'bg-red-400'
                  : 'bg-gray-200'
            }`}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-200 pt-4">
        <button
          onClick={() => onStatusChange(application)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition"
        >
          <Edit2 className="w-4 h-4" />
          Update Status
        </button>
        <button
          onClick={() => onDelete(application.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;