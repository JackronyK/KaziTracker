// src/components/Resume/ResumeDetail.tsx
/**
 * ResumeDetail Component
 * Detailed view of a resume with editing capability
 */

import { useState } from 'react';
import { X, Edit2, Download } from 'lucide-react';
import type { Resume } from '../../types';
import { formatDate } from '../../utils/formatters';
import { ResumeTagManager } from './ResumeTagManager';
import { logInfo } from '../../utils/errorLogger';

interface ResumeDetailProps {
  resume: Resume;
  onClose: () => void;
  onTagsChange: (tags: string[]) => void;
}

/**
 * ResumeDetail Component
 * 
 * Props:
 * - resume: Resume to display
 * - onClose: Callback to close detail view
 * - onTagsChange: Callback when tags updated
 * 
 * Features:
 * - Full resume details
 * - File information
 * - Tag management
 * - Download link
 * - Close button
 */
export const ResumeDetail = ({
  resume,
  onClose,
  onTagsChange,
}: ResumeDetailProps) => {
  const [tags, setTags] = useState(resume.tags || []);
  const [isEditing, setIsEditing] = useState(false);

  // Handle save tags
  const handleSaveTags = () => {
    onTagsChange(tags);
    setIsEditing(false);
    logInfo('Resume tags saved', { resumeId: resume.id });
  };

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getFileIcon(resume.file_type)}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {resume.original_filename}
              </h2>
              <p className="text-sm text-gray-600">Resume Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              File Information
            </h3>
            <div className="space-y-2 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Filename:</span>
                <span className="text-sm font-medium text-gray-900">
                  {resume.filename}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">File Type:</span>
                <span className="text-sm font-medium text-gray-900">
                  {resume.file_type.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">File Size:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatFileSize(resume.file_size)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uploaded:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(resume.uploaded_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(resume.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Done' : 'Edit'}
              </button>
            </div>

            {isEditing ? (
              <div>
                <ResumeTagManager
                  tags={tags}
                  onTagsChange={setTags}
                />
                <button
                  onClick={handleSaveTags}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Save Tags
                </button>
              </div>
            ) : tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No tags yet</p>
            )}
          </div>

          {/* Actions */}
          {resume.url && (
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <a
                href={resume.url}
                download={resume.original_filename}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeDetail;