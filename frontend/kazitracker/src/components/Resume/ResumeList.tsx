// src/components/Resume/ResumeList.tsx

/**
 * ResumeList Component - FIXED
 * Displays resumes with proper filename and working action buttons
 */

import { Download, Eye, Edit2, Trash2, FileText } from 'lucide-react';
import type { Resume } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface ResumeListProps {
  resumes: Resume[];
  onView: (resume: Resume) => void;
  onEdit: (resume: Resume) => void;
  onDownload: (resume: Resume) => void;
  onDelete: (resume: Resume) => void;
  onTagsChange: (id: number, tags: string) => void;
}

export const ResumeList = ({
  resumes,
  onView,
  onEdit,
  onDownload,
  onDelete,
  onTagsChange,
}: ResumeListProps) => {
  /**
   * Format file size to human-readable format
   */
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Get file type icon
   */
  const getFileIcon = (fileType: string) => {
    if (fileType === 'pdf') {
      return (
        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-red-600" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
        <FileText className="w-6 h-6 text-blue-600" />
      </div>
    );
  };

  /**
   * Get file type badge color
   */
  const getFileTypeBadge = (fileType: string) => {
    if (fileType === 'pdf') {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="divide-y divide-gray-200">
        {resumes.map((resume) => {
          // Parse tags
          const tags = resume.tags
            ?.split(',')
            .map(t => t.trim())
            .filter(Boolean) || [];

          return (
            <div
              key={resume.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* File Icon */}
                {getFileIcon(resume.file_type)}

                {/* Resume Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Filename */}
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {resume.filename || 'Untitled Resume'}
                      </h3>

                      {/* File Type & Upload Date */}
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${getFileTypeBadge(
                            resume.file_type
                          )}`}
                        >
                          {resume.file_type.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          Uploaded: {formatDate(resume.created_at)}
                        </span>
                      </div>

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* View Button */}
                      <button
                        onClick={() => onView(resume)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit(resume)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit tags"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      {/* Download Button */}
                      <button
                        onClick={() => onDownload(resume)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download in new tab"
                      >
                        <Download className="w-5 h-5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(resume)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResumeList;