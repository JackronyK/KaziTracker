// src/components/Resume/ResumeDetail.tsx

/**
 * ResumeDetail Component
 * Detailed view of a resume with editing capability
 */

import { useState, useMemo } from 'react';
import { X, Edit2, Download } from 'lucide-react';
import type { Resume } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { logInfo } from '../../utils/errorLogger';

interface ResumeDetailProps {
  resume: Resume;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
  onTagsChange: (tags: string) => void;
}

/**
 * ResumeDetail Component
 * 
 * Props:
 * - resume: Resume to display
 * - onClose: Callback to close detail view
 * - onEdit: Callback to open edit modal
 * - onDownload: Callback to download resume
 * - onTagsChange: Callback when tags updated (sends comma-separated string)
 * 
 * Features:
 * - Full resume details with file info
 * - File size display
 * - Tag display
 * - Download and edit buttons
 * - Close button
 */
export const ResumeDetail = ({
  resume,
  onClose,
  onEdit,
  onDownload,
  onTagsChange,
}: ResumeDetailProps) => {
  // =========================================================================
  // STATE
  // =========================================================================
  
  // Parse tags from string to array
  // resume.tags is a string like "senior, fullstack, 2024"
  // We need to convert it to an array for display
  const [isEditing, setIsEditing] = useState(false);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================
  
  // Parse tags string into array (memoized to prevent unnecessary recalculations)
  const tagList = useMemo(() => {
    if (!resume.tags) return [];
    return resume.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }, [resume.tags]);

  // =========================================================================
  // UTILITIES
  // =========================================================================

  /**
   * Format file size from bytes to human readable format
   */
  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return 'Unknown';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Get file icon based on file type
   */
  const getFileIcon = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType === 'pdf' || lowerType.includes('pdf')) return '📄';
    if (lowerType === 'docx' || lowerType === 'doc' || lowerType.includes('word')) return '📝';
    return '📎';
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getFileIcon(resume.file_type)}</span>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {resume.filename || 'Resume'}
              </h2>
              <p className="text-sm text-gray-600">Resume Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* File Information Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              File Information
            </h3>
            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              
              {/* Filename */}
              <div className="flex justify-between items-start gap-2">
                <span className="text-sm text-gray-600">Filename:</span>
                <span className="text-sm font-medium text-gray-900 text-right">
                  {resume.filename}
                </span>
              </div>

              {/* File Type */}
              <div className="flex justify-between items-start gap-2">
                <span className="text-sm text-gray-600">File Type:</span>
                <span className="text-sm font-medium text-gray-900">
                  {resume.file_type.toUpperCase()}
                </span>
              </div>

              {/* File Size */}
              <div className="flex justify-between items-start gap-2">
                <span className="text-sm text-gray-600">File Size:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatFileSize(resume.file_size)}
                </span>
              </div>

              {/* Uploaded Date */}
              <div className="flex justify-between items-start gap-2">
                <span className="text-sm text-gray-600">Uploaded:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(resume.created_at)}
                </span>
              </div>

              {/* Last Updated Date */}
              <div className="flex justify-between items-start gap-2">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(resume.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                title={isEditing ? 'Done editing' : 'Edit tags'}
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Done' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              // Edit mode - show input for tags
              <div className="space-y-3">
                <input
                  type="text"
                  defaultValue={resume.tags || ''}
                  placeholder="e.g., senior, fullstack, 2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  id="tags-input"
                />
                <p className="text-xs text-gray-500">
                  Separate tags with commas
                </p>
                <button
                  onClick={() => {
                    const input = document.getElementById('tags-input') as HTMLInputElement;
                    onTagsChange(input.value);
                    setIsEditing(false);
                    logInfo('Resume tags updated', { resumeId: resume.id });
                  }}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save Tags
                </button>
              </div>
            ) : tagList.length > 0 ? (
              // Display mode - show tags as pills
              <div className="flex flex-wrap gap-2">
                {tagList.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              // No tags
              <p className="text-sm text-gray-500 italic">No tags yet</p>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            {/* Download Button */}
            <button
              onClick={onDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              title="Download resume file"
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            {/* Edit Button */}
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              title="Edit resume and file"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              title="Close details"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetail;