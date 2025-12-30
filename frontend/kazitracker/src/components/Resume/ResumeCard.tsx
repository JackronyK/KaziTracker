// src/components/Resume/ResumeCard.tsx
/**
 * ResumeCard Component
 * Displays individual resume with actions
 */

import { Eye, Trash2, Download} from 'lucide-react';
import type { Resume } from '../../types';
import { formatDate } from '../../utils/formatters';

interface ResumeCardProps {
  resume: Resume;
  onDelete: (id: number) => void;
  onTagsChange: (id: number, tags: string[]) => void;
  onView?: (resume: Resume) => void;
}

/**
 * ResumeCard Component
 * 
 * Props:
 * - resume: Resume object to display
 * - onDelete: Callback when delete clicked
 * - onTagsChange: Callback when tags update
 * - onView: Callback when view clicked
 * 
 * Features:
 * - File name and type
 * - File size and date
 * - Tags display
 * - View, download, delete buttons
 * - Hover effects
 */
export const ResumeCard = ({
  resume,
  onDelete,
  onView,
}: ResumeCardProps) => {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (type: string): string => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* File Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-3xl">{getFileIcon(resume.file_type)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {resume.original_filename}
            </h3>
            <p className="text-sm text-gray-600">
              {formatFileSize(resume.file_size)} • {resume.file_type.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* File Info */}
      <div className="space-y-1 mb-4 text-sm text-gray-600">
        <p>Uploaded: {formatDate(resume.uploaded_at)}</p>
        {resume.tags && resume.tags.length > 0 && (
          <p>Tags: {resume.tags.length} tag{resume.tags.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Tags Display */}
      {resume.tags && resume.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {resume.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
            {resume.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                +{resume.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-200 pt-4">
        <button
          onClick={() => onView?.(resume)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        
        {resume.url && (
          <a
            href={resume.url}
            download={resume.original_filename}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded transition"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        )}

        <button
          onClick={() => onDelete(resume.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
};

export default ResumeCard;