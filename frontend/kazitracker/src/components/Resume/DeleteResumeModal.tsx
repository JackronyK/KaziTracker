// src/components/Resume/DeleteResumeMOdal.tsx
/**
 * DeleteResumeModal Component
 * Confirmation dialog for deleting resumes
 */

import { X, AlertTriangle } from 'lucide-react';
import type { Resume } from '../../types';

interface DeleteResumeModalProps {
  resume: Resume;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * DeleteResumeModal Component
 * 
 * Props:
 * - resume: Resume to delete
 * - onConfirm: Callback to confirm delete
 * - onCancel: Callback to cancel
 * - isLoading: Loading state
 * 
 * Features:
 * - Confirmation message
 * - File information
 * - Confirm/Cancel buttons
 * - Loading state
 */
export const DeleteResumeModal = ({
  resume,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteResumeModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Delete Resume?</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this resume? This action cannot be
              undone.
            </p>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-semibold text-gray-900">
                {resume.filename}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {resume.tags && resume.tags.length > 0
                  ? `Tags: ${resume.tags}`
                  : 'No tags'}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete Resume'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteResumeModal;