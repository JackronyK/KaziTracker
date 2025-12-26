// src/components/application/CreateApplicationModal.tsx
/**
 * CreateApplicationModal Component
 * Modal for creating new applications from saved jobs
 */

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import { logInfo, logError } from '../../utils/errorLogger';

interface CreateApplicationModalProps {
  jobs: any[];
  onClose: () => void;
  onApplicationCreated: () => void;
}

/**
 * CreateApplicationModal Component
 * 
 * Props:
 * - onClose: Callback to close modal
 * - onApplicationCreated: Callback after application created
 * 
 * Features:
 * - Select from saved jobs
 * - Optional notes field
 * - Form validation
 * - Error handling
 * - Loading state
 */
export const CreateApplicationModal = ({
  jobs,
  onClose,
  onApplicationCreated,
}: CreateApplicationModalProps) => {
  const { createApplication, loading: appLoading } = useApplications();


  // State
  const [jobId, setJobId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Handle save
  const handleCreate = async () => {
    if (!jobId) {
      setError('Please select a job');
      return;
    }

    try {
      setError('');
      logInfo('Creating application', { jobId });

      const success = await createApplication({
        job_id: parseInt(jobId),
        status: 'Saved',
        notes: notes || null,
      });

      if (success) {
        logInfo('Application created successfully');
        onApplicationCreated();
      } else {
        setError('Failed to create application. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      logError('Application creation failed', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create Application</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info */}
          <p className="text-gray-600 text-sm">
            Select a job from your saved positions to create an application.
          </p>

          {/* Job Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Job *
            </label>

            {jobs.length === 0 ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  📌 No saved jobs found. Please{' '}
                  <span className="font-medium">add jobs first</span> before creating
                  applications.
                </p>
              </div>
            ) : (
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a job --</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.company}
                    {job.location && ` (${job.location})`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Job Details */}
          {jobId && (
            <div className="p-4 bg-gray-50 rounded-lg">
              {(() => {
                const job = jobs.find((j) => j.id === parseInt(jobId));
                return job ? (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {job.title}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>🏢 {job.company}</p>
                      {job.location && <p>📍 {job.location}</p>}
                      {job.salary_range && <p>💰 {job.salary_range}</p>}
                      {job.seniority_level && <p>📈 {job.seniority_level}</p>}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this application (e.g., referral, key contact)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
            />
            <p className="text-xs text-gray-500 mt-1">
              {notes.length}/500 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={appLoading || !jobId}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {appLoading ? 'Creating...' : 'Create Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateApplicationModal;