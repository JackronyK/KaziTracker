// src/components/applications/UpdateStatusModal.tsx
/**
 * UpdateStatusModal Component - IMPROVED VERSION
 * Modal for updating application status with validation and error handling
 */

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import type { Application } from '../../types/index';
import { logInfo, logError } from '../../utils/errorLogger';
import { RejectionModal } from './RejectionModal';
import { OfferModal } from './OfferModal';
import { formatDateTime } from '../../utils/formatters';

interface UpdateStatusModalProps {
  application: Application;
  onClose: () => void;
  onStatusUpdated: () => void;
}

interface OfferDetails {
  title?: string;
  salary?: string;
  startDate?: string;
  benefits?: string;
  notes?: string;
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

const STATUS_FLOW: Record<string, string[]> = {
  'Saved': ['Applied'],
  'Applied': ['Interview', 'Rejected'],
  'Interview': ['Offer', 'Rejected'],
  'Offer': ['Rejected'],
  'Rejected': ['Applied'],
};

const ALL_STATUSES = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];

export const UpdateStatusModal = ({
  application,
  onClose,
  onStatusUpdated,
}: UpdateStatusModalProps) => {
  const { updateApplication, loading } = useApplications();

  /**
   * Format date for input field (handles timezone issues)
   */
  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  /**
   * Safely parse offer details from JSON string
   */
  const parseOfferDetails = (): OfferDetails => {
    if (!application.offer_details) return {};
    try {
      return JSON.parse(application.offer_details);
    } catch (err) {
      logError('Failed to parse offer details', err);
      return {};
    }
  };

  // State
  const [newStatus, setNewStatus] = useState(application.status);
  const [appliedDate, setAppliedDate] = useState(formatDateTime(application.applied_date));
  const [interviewDate, setInterviewDate] = useState(formatDateTime(application.interview_date));
  const [rejectionReason, setRejectionReason] = useState(application.rejection_reason || '');
  const [offerDetails, setOfferDetails] = useState<OfferDetails>(parseOfferDetails());
  const [offerDate, setOfferDate] = useState(formatDateTime(application.offer_date));
  const [rejectedDate, setRejectedDate] = useState(formatDateTime(application.rejected_date));
  const [error, setError] = useState('');
  const [showConfirmReject, setShowConfirmReject] = useState(false);

  /**
   * Get allowed status transitions for current status
   */
  const getAllowedStatuses = (): string[] => {
    return STATUS_FLOW[application.status] || [];
  };

  /**
   * Check if a status transition is allowed
   */
  const isStatusAllowed = (status: string): boolean => {
    return getAllowedStatuses().includes(status);
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string): string => {
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

  /**
   * Validate dates are in correct order
   */
  const validateDateOrder = (): boolean => {
    const dates: { [key: string]: string } = {
      applied: appliedDate,
      interview: interviewDate,
      offer: offerDate,
      rejected: rejectedDate,
    };

    const dateValues = Object.entries(dates)
      .filter(([, val]) => val)
      .map(([key, val]) => ({ key, date: new Date(val) }));

    for (let i = 0; i < dateValues.length - 1; i++) {
      if (dateValues[i].date > dateValues[i + 1].date) {
        setError(`${dateValues[i].key} date cannot be after ${dateValues[i + 1].key} date`);
        return false;
      }
    }
    return true;
  };

  /**
   * Validate required fields based on status
   */
  const validateRequiredFields = (): boolean => {
    setError('');

    if (newStatus === 'Rejected') {
      if (!rejectionReason.trim()) {
        setError('Rejection reason is required');
        return false;
      }
      if (!rejectedDate) {
        setError('Rejection date is required');
        return false;
      }
    }

    if (newStatus === 'Offer') {
      //** if (!Object.keys(offerDetails).length || !offerDetails.title?.trim()) {
       //   setError('Offer title is required');
      //  return false;
    //  } **/
      if (!offerDate) {
        setError('Offer date is required');
        return false;
      }
    }

    if (newStatus !== 'Saved' && !appliedDate) {
      setError('Applied date is required');
      return false;
    }

    if (['Interview', 'Offer', 'Rejected'].includes(newStatus) && !interviewDate) {
      setError('Interview date is required');
      return false;
    }

    return validateDateOrder();
  };

  /**
   * Handle status change with validation
   */
  const handleStatusChange = (status: string) => {
    if (!isStatusAllowed(status)) {
      setError(`Cannot change from ${application.status} to ${status}`);
      return;
    }

    if (status === 'Rejected' && newStatus !== 'Rejected') {
      setShowConfirmReject(true);
      setNewStatus(status);
    } else {
      setNewStatus(status);
      setShowConfirmReject(false);
      setError('');
    }
  };

/**
 * Handle save
 */
const handleSave = async () => {
  try {
    if (!validateRequiredFields()) {
      return;
    }

    setError('');
    logInfo('Updating application status', {
      appId: application.id,
      newStatus,
    });

    // Validate offerDetails before stringifying
    let offerDetailsString = '';
    if (newStatus === 'Offer') {
      try {
        offerDetailsString = JSON.stringify(offerDetails);
      } catch (err) {
        setError('Failed to save offer details');
        logError('Offer details stringify failed', err);
        return;
      }
    }

    // Convert empty date strings to null
    const success = await updateApplication(application.id, {
      status: newStatus,
      applied_date: appliedDate || null,        // Convert empty string to null
      interview_date: interviewDate || null,    // Convert empty string to null
      offer_date: offerDate || null,            // Convert empty string to null
      rejected_date: rejectedDate || null,      // Convert empty string to null
      rejection_reason: newStatus === 'Rejected' ? rejectionReason : null,  // Also convert empty rejection reason to null
      offer_details: offerDetailsString,
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

  const isStatusChanged = newStatus !== application.status;
  const canSave = isStatusChanged && !loading;
  const allowedStatuses = getAllowedStatuses();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

          {/* New Status Selection - Show all statuses, disable invalid transitions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {ALL_STATUSES.map((status) => {
                const allowed = isStatusAllowed(status);
                const isSelected = newStatus === status;

                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={!allowed || status === application.status}
                    className={`py-3 px-2 rounded-lg font-medium text-sm transition ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : allowed
                        ? `bg-gray-100 ${getStatusColor(status)} hover:bg-gray-200 cursor-pointer`
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                    title={!allowed ? `Cannot transition to ${status} from ${application.status}` : ''}
                  >
                    {status === 'Saved' && '📌'}
                    {status === 'Applied' && '📤'}
                    {status === 'Interview' && '🎯'}
                    {status === 'Offer' && '🎉'}
                    {status === 'Rejected' && '❌'}
                    <br />
                    <span className="text-xs">{status}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Disabled statuses are not valid transitions from your current status
            </p>
          </div>

          {/* Rejection Confirmation Modal */}
          {showConfirmReject && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-900 mb-3">
                ⚠️ Are you sure you want to reject this application?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setNewStatus(application.status);
                    setShowConfirmReject(false);
                    setError('');
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition"
                >
                  Keep Current Status
                </button>
                <button
                  onClick={() => setShowConfirmReject(false)}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {/* Rejection Modal */}
          {newStatus === 'Rejected' && !showConfirmReject && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <label className="block text-sm font-medium text-red-900 mb-2">
                Rejection Reason <span className="text-red-600">*</span>
              </label>
              <RejectionModal
                rejectionReason={rejectionReason}
                onReasonChange={setRejectionReason}
              />
              {!rejectionReason.trim() && (
                <p className="text-xs text-red-600 mt-1">This field is required</p>
              )}
            </div>
          )}

          {/* Offer Modal */}
          {newStatus === 'Offer' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <label className="block text-sm font-medium text-green-900 mb-2">
                Offer Details <span className="text-green-600">*</span>
              </label>
              <OfferModal offerDetails={offerDetails} onDetailsChange={setOfferDetails} />
              {(!offerDetails.title || !offerDetails.title.trim()) && (
                <p className="text-xs text-green-600 mt-1">Offer title is required</p>
              )}
            </div>
          )}

          {/* Date Pickers */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            {/* Applied Date */}
            {newStatus !== 'Saved' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applied Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={appliedDate}
                  onChange={(e) => {
                    setAppliedDate(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Interview Date */}
            {['Interview', 'Offer', 'Rejected'].includes(newStatus) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => {
                    setInterviewDate(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Offer Date */}
            {newStatus === 'Offer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={offerDate}
                  onChange={(e) => {
                    setOfferDate(e.target.value);
                    setError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Rejected Date */}
            {newStatus === 'Rejected' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={rejectedDate}
                  onChange={(e) => {
                    setRejectedDate(e.target.value);
                    setError('');
                  }}
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
              disabled={!canSave}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
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