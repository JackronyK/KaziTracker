// src/components/Resume/ResumeUploader.tsx
/**
 * ResumeUploader Component
 * Drag-and-drop file upload with validation
 */

import { useState, useRef } from 'react';
import { Upload, FileCheck, AlertCircle } from 'lucide-react';
import { logInfo, logError } from '../../utils/errorLogger';

interface ResumeUploaderProps {
  onUpload: (file: File) => Promise<boolean>;
  isLoading: boolean;
}

/**
 * ResumeUploader Component
 * 
 * Props:
 * - onUpload: Callback to handle file upload
 * - isLoading: Loading state during upload
 * 
 * Features:
 * - Drag-and-drop upload
 * - Click to browse
 * - File validation
 * - Progress indication
 * - Error messages
 */
export const ResumeUploader = ({
  onUpload,
  isLoading,
}: ResumeUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Allowed file types
  const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only PDF and Word documents are allowed';
    }
    if (file.size > MAX_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  // Handle drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');
    setSuccess('');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      logInfo('File dropped', { name: file.name, size: file.size });
      await handleFile(file);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  // Handle file input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  // Handle file processing
  const handleFile = async (file: File) => {
    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      logError('File validation failed', new Error(validationError));
      return;
    }

    try {
      logInfo('Uploading resume', { name: file.name });
      const success = await onUpload(file);

      if (success) {
        setSuccess(`${file.name} uploaded successfully!`);
        logInfo('Resume uploaded successfully');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during upload.');
      logError('Resume upload error', err as Error);
    }
  };

  return (
    <div className="mb-8">
      {/* Drag-Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-lg border-2 border-dashed cursor-pointer transition ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="text-center">
          {isLoading ? (
            <>
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-900 font-semibold mb-1">
                Drag resume here or click to browse
              </p>
              <p className="text-sm text-gray-600">
                PDF or Word document (max 5MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
          <FileCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 mt-3">
        💡 Tip: Upload the resume you want to use for this round of applications
      </p>
    </div>
  );
};

export default ResumeUploader;