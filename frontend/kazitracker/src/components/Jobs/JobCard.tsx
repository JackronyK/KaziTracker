// src/components/Jobs/JobCard.tsx

/**
 * JobCard Component
 * Displays individual job with details and actions
 */

import { Edit2, Trash2, MapPin, DollarSign, Briefcase } from "lucide-react";
import type { Job } from "../../types/index";
import { formatDate } from "../../utils/formatters";

interface JobCardProps {
    job: Job;
    onEdit: (job: Job) => void;
    onDelete: (id: number) => void;
}

/**
 * JobCard Component
 * 
 * Props:
 * - job: Job object to display
 * - onEdit: Callback when edit clicked
 * - onDelete: Callback when delete clicked
 * 
 * Features:
 * - Job title and company
 * - Location, salary, experience
 * - Seniority level badge
 * - Tech stack
 * - Created date
 * - Edit and delete buttons
 * - Hover effects
 */
export const JobCard = ({ job, onEdit, onDelete }: JobCardProps) => {
  // Get seniority color
  const getSeniorityColor = (level: string | undefined) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    switch (level.toLowerCase()) {
      case 'junior':
        return 'bg-green-100 text-green-800';
      case 'mid':
        return 'bg-blue-100 text-blue-800';
      case 'senior':
        return 'bg-purple-100 text-purple-800';
      case 'lead':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header: Title and Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {job.title}
          </h3>
          <p className="text-gray-600 font-medium">{job.company}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getSeniorityColor(job.seniority_level)}`}>
          {job.seniority_level}
        </span>
      </div>

      {/* Location and Salary */}
      <div className="space-y-2 mb-4">
        {job.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            {job.location}
          </div>
        )}
        {job.salary_range && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-gray-400" />
            {job.salary_range}
          </div>
        )}
        {job.experience_required && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="w-4 h-4 text-gray-400" />
            {job.experience_required} experience
          </div>
        )}
      </div>

      {/* Tech Stack */}
      {job.tech_stack && job.tech_stack.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {job.tech_stack.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tech}
              </span>
            ))}
            {job.tech_stack.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{job.tech_stack.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description Preview */}
      {job.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {job.description}
          </p>
        </div>
      )}

      {/* Date */}
      <div className="text-xs text-gray-500 mb-4">
        Added {formatDate(job.created_at)}
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-200 pt-4">
        <button
          onClick={() => onEdit(job)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(job.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default JobCard;

