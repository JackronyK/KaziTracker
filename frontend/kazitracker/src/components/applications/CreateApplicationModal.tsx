// src/components/applications/CreateApplicationModal.tsx

/**
 * CreateApplicationModal Component - ENHANCED
 * Modal for creating new applications from saved jobs WITH RESUME SELECTION
 */

import { useState } from 'react';
import { X, AlertCircle, FileText } from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import type { Resume } from '../../types';
import { logInfo, logError } from '../../utils/errorLogger';

interface CreateApplicationModalProps {
  jobs: any[];
  resumes: Resume[];
  onClose: () => void;
  onApplicationCreated?: () => void;
}

/**
 * CreateApplicationModal Component
 * 
 * Props:
 * - jobs: Available jobs to select from
 * - resumes: Available resumes to select from
 * - onClose: Callback to close modal
 * - onApplicationCreated: Callback after application created
 * 
 * Features:
 * - Select job (required)
 * - Select resume (REQUIRED for tracking performance)
 * - Optional notes field
 * - Shows selected resume details
 * - Form validation
 * - Error handling
 * - Loading state
 */
export const CreateApplicationModal = ({
  jobs,
  resumes,
  onClose,
  onApplicationCreated,
}: CreateApplicationModalProps) => {
  const { createApplication, loading: appLoading } = useApplications();

  // =========================================================================
  // STATE
  // =========================================================================

  const [jobId, setJobId] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  const selectedJob = jobId ? jobs.find(j => j.id === parseInt(jobId)) : null;
  const selectedResume = resumeId ? resumes.find(r => r.id === parseInt(resumeId)) : null;

  /**
   * Check if form is valid
   */
  const isFormValid = jobId && resumeId;

  /**
   * Format file size
   */
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Get resume tags
   */
  const getResumeTags = (resume: Resume): string[] => {
    if (!resume.tags) return [];
    return resume.tags.split(',').map(t => t.trim()).filter(Boolean);
  };

  // =========================================================================
  // HANDLERS
  // =========================================================================

  /**
   * Handle application creation
   */
  const handleCreate = async () => {
    // Validate form
    if (!jobId) {
      setError('Please select a job');
      return;
    }

    if (!resumeId) {
      setError('Please select a resume - this helps track CV performance');
      return;
    }

    try {
      setError('');
      logInfo('Creating application', { jobId, resumeId });

      const success = await createApplication({
        job_id: parseInt(jobId),
        resume_id: parseInt(resumeId),
        status: 'saved',
        notes: notes || undefined,
      });

      if (success) {
        logInfo('Application created successfully', { jobId, resumeId });
        
        // ✅ SAFETY: Check if function exists before calling
        if (onApplicationCreated && typeof onApplicationCreated === 'function') {
          onApplicationCreated();
        } else {
          // ✅ DEFAULT: Close modal if no callback provided
          onClose();
        }
      } else {
        setError('Failed to create application. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      logError('Application creation failed', err as Error);
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Application</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select a job and resume to track CV performance
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Info Alert */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Resume Selection Required</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Selecting a resume helps track which CV is performing best across your applications
              </p>
            </div>
          </div>

          {/* Job Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Job <span className="text-red-600">*</span>
            </label>

            {jobs.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  📌 No saved jobs found. Please add jobs first before creating applications.
                </p>
              </div>
            ) : (
              <select
                value={jobId}
                onChange={(e) => {
                  setJobId(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">-- Select a job --</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} at {job.company}
                    {job.location && ` (${job.location})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Job Details */}
          {selectedJob && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">
                {selectedJob.title}
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>🏢 <span className="font-medium">{selectedJob.company}</span></p>
                {selectedJob.location && (
                  <p>📍 <span className="font-medium">{selectedJob.location}</span></p>
                )}
                {selectedJob.salary_range && (
                  <p>💰 <span className="font-medium">{selectedJob.salary_range}</span></p>
                )}
                {selectedJob.seniority_level && (
                  <p>📈 <span className="font-medium">{selectedJob.seniority_level}</span></p>
                )}
              </div>
            </div>
          )}

          {/* Resume Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Resume <span className="text-red-600">*</span>
            </label>

            {resumes.length === 0 ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  📋 No resumes found. Please upload a resume first.
                </p>
              </div>
            ) : (
              <select
                value={resumeId}
                onChange={(e) => {
                  setResumeId(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">-- Select a resume --</option>
                {resumes.map((resume) => {
                  const tags = getResumeTags(resume);
                  return (
                    <option key={resume.id} value={resume.id}>
                      {resume.filename}
                      {tags.length > 0 && ` (${tags.join(', ')})`}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Selected Resume Details */}
          {selectedResume && (
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedResume.filename}
                  </h4>
                  <div className="space-y-1 text-xs text-gray-600 mb-2">
                    <p>📄 Type: <span className="font-medium">{selectedResume.file_type.toUpperCase()}</span></p>
                    <p>📊 Size: <span className="font-medium">{formatFileSize(selectedResume.file_size)}</span></p>
                  </div>
                  
                  {/* Tags */}
                  {getResumeTags(selectedResume).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {getResumeTags(selectedResume).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-500 text-xs font-normal">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this application (e.g., referral, key contact, deadline)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20"
            />
            <p className="text-xs text-gray-500 mt-1">
              {notes.length}/500 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!isFormValid || appLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {appLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                'Create Application'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateApplicationModal;