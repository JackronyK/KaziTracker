// src/components/applications/UpdateStatusModal.tsx
/**
 * UpdateStatusModal Component
 * Modal for updating application status
 */

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import type { Application } from '../../types/index';
import { logInfo, logError } from '../../utils/errorLogger';

interface UpdateStatusModalProps {
  application: Application;
  onClose: () => void;
  onStatusUpdated: () => void;
}

/**
 * UpdateStatusModal Component
 * 
 * Props:
 * - application: Application to update
 * - onClose: Callback to close modal
 * - onStatusUpdated: Callback after status updated
 * 
 * Features:
 * - Change application status
 * - Optional date picker for status dates
 * - Status flow validation
 * - Error handling
 * - Loading state
 */
export const UpdateStatusModal = ({
  application,
  onClose,
  onStatusUpdated,
}: UpdateStatusModalProps) => {
  const { updateApplicationStatus, loading } = useApplications();

  // State
  const [newStatus, setNewStatus] = useState(application.status);
  const [appliedDate, setAppliedDate] = useState(
    application.applied_date ? new Date(application.applied_date).toISOString().split('T')[0] : ''
  );
  const [interviewDate, setInterviewDate] = useState(
    application.interview_date ? new Date(application.interview_date).toISOString().split('T')[0] : ''
  );
  const [offerDate, setOfferDate] = useState(
    application.offer_date ? new Date(application.offer_date).toISOString().split('T')[0] : ''
  );
  const [rejectedDate, setRejectedDate] = useState(
    application.rejected_date ? new Date(application.rejected_date).toISOString().split('T')[0] : ''
  );
  const [error, setError] = useState('');

  // Status options
  const statuses = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Saved':
        return 'text-gray-600';
      case 'Applied':
        return 'text-blue-600';
      case 'Interview':
        return 'text-purple-600';
      case 'Offer':
        return 'text-green-600';
      case 'Rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      setError('');
      logInfo('Updating application status', {
        appId: application.id,
        newStatus,
      });

      const success = await updateApplicationStatus(application.id, {
        status: newStatus,
        applied_date: appliedDate || null,
        interview_date: interviewDate || null,
        offer_date: offerDate || null,
        rejected_date: rejectedDate || null,
      });

      if (success) {
        logInfo('Status updated successfully');
        onStatusUpdated();
      } else {
        setError('Failed to update status. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      logError('Status update failed', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Update Status</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Current Status */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Current Status</p>
            <div className="p-3 bg-gray-50 rounded-lg font-medium">
              {application.status}
            </div>
          </div>

          {/* New Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className={`py-3 px-2 rounded-lg font-medium text-sm transition ${
                    newStatus === status
                      ? 'bg-blue-600 text-white'
                      : `bg-gray-100 ${getStatusColor(status)} hover:bg-gray-200`
                  }`}
                >
                  {status === 'Saved' && '📌'}
                  {status === 'Applied' && '📤'}
                  {status === 'Interview' && '🎯'}
                  {status === 'Offer' && '🎉'}
                  {status === 'Rejected' && '❌'}
                  <br />
                  <span className="text-xs">{status}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Pickers */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            {/* Applied Date */}
            {newStatus !== 'Saved' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applied Date
                </label>
                <input
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Interview Date */}
            {['Interview', 'Offer', 'Rejected'].includes(newStatus) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Offer Date */}
            {newStatus === 'Offer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Date
                </label>
                <input
                  type="date"
                  value={offerDate}
                  onChange={(e) => setOfferDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Rejected Date */}
            {newStatus === 'Rejected' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Date
                </label>
                <input
                  type="date"
                  value={rejectedDate}
                  onChange={(e) => setRejectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
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
              onClick={handleSave}
              disabled={loading || newStatus === application.status}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;