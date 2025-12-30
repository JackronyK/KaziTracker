// src/components/applications/UpdateStatusModal.tsx
/**
 * UpdateStatusModal Component - FIXED VERSION
 * Fixed case sensitivity issues with status values
 */

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import type { Application, ApplicationStatus } from '../../types/index';
import { logInfo, logError } from '../../utils/errorLogger';
import { RejectionModal } from './RejectionModal';
import { OfferModal } from '../Premium/OfferModal';

interface UpdateStatusModalProps {
  application: Application;
  onClose: () => void;
  onStatusUpdated: () => void;
}

interface OfferDetails {
  title?: string;
  salary?: string;
  startDate?: string;
  benefits?: string[];
  notes?: string;
}

/**
 * Status flow mapping - uses LOWERCASE to match database values
 */
const STATUS_FLOW: Record<string, string[]> = {
  'saved': ['applied'],
  'applied': ['interview', 'rejected'],
  'interview': ['offer', 'rejected'],
  'offer': ['rejected'],
  'rejected': ['applied'],
};

const ALL_STATUSES = [
  { value: 'saved', label: 'Saved', emoji: '📌' },
  { value: 'applied', label: 'Applied', emoji: '📤' },
  { value: 'interview', label: 'Interview', emoji: '🎯' },
  { value: 'offer', label: 'Offer', emoji: '🎉' },
  { value: 'rejected', label: 'Rejected', emoji: '❌' },
];

export const UpdateStatusModal = ({
  application,
  onClose,
  onStatusUpdated,
}: UpdateStatusModalProps) => {
  const { updateApplication, loading } = useApplications();

  /**
   * Format date for input field
   */
  const formatDateForInput = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  /**
   * Parse offer details safely
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

  // Normalize status to lowercase
  const currentStatus = application.status.toLowerCase();

  // State - all status values in LOWERCASE
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [appliedDate, setAppliedDate] = useState(formatDateForInput(application.applied_date));
  const [interviewDate, setInterviewDate] = useState(formatDateForInput(application.interview_date));
  const [rejectionReason, setRejectionReason] = useState(application.reason_for_rejection || '');
  const [offerDate, setOfferDate] = useState(formatDateForInput(application.offer_date));
  const [rejectedDate, setRejectedDate] = useState(formatDateForInput(application.rejected_date));
  const [error, setError] = useState('');
  const [showConfirmReject, setShowConfirmReject] = useState(false);


  const [offerDetails, setOfferDetails] = useState<OfferDetails>(parseOfferDetails());
  /**
   * Get allowed status transitions
   */
  const getAllowedStatuses = (): string[] => {
    return STATUS_FLOW[currentStatus] || [];
  };

  /**
   * Check if status transition is allowed
   */
  const isStatusAllowed = (status: string): boolean => {
    return getAllowedStatuses().includes(status);
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'saved':
        return 'text-gray-600';
      case 'applied':
        return 'text-blue-600';
      case 'interview':
        return 'text-purple-600';
      case 'offer':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  /**
   * Validate date order
   */
  const validateDateOrder = (): boolean => {
    const dates: Array<{ key: string; value: string }> = [];
    
    if (appliedDate) dates.push({ key: 'Applied', value: appliedDate });
    if (interviewDate) dates.push({ key: 'Interview', value: interviewDate });
    if (offerDate) dates.push({ key: 'Offer', value: offerDate });
    if (rejectedDate) dates.push({ key: 'Rejected', value: rejectedDate });

    for (let i = 0; i < dates.length - 1; i++) {
      if (new Date(dates[i].value) > new Date(dates[i + 1].value)) {
        setError(`${dates[i].key} date cannot be after ${dates[i + 1].key} date`);
        return false;
      }
    }
    return true;
  };

  /**
   * Validate required fields
   */
  const validateRequiredFields = (): boolean => {
    setError('');

    // Check for status change
    if (newStatus === currentStatus) {
      setError('Please select a different status');
      return false;
    }

    // Rejected status validation
    if (newStatus === 'rejected') {
      if (!rejectionReason.trim()) {
        setError('Rejection reason is required');
        return false;
      }
      if (!rejectedDate) {
        setError('Rejection date is required');
        return false;
      }
    }

    // Offer status validation
    if (newStatus === 'offer') {
      if (!offerDate) {
        setError('Offer date is required');
        return false;
      }
    }

    // Applied date required for all statuses except Saved
    if (newStatus !== 'saved' && !appliedDate) {
      setError('Applied date is required when moving to ' + newStatus);
      return false;
    }

    // Interview date required for Interview, Offer, Rejected
    if (['interview', 'offer', 'rejected'].includes(newStatus) && !interviewDate) {
      setError('Interview date is required for ' + newStatus + ' status');
      return false;
    }

    return validateDateOrder();
  };

  /**
   * Handle status change
   */
  const handleStatusChange = (status: string) => {
    if (!isStatusAllowed(status)) {
      setError(`Cannot change from ${currentStatus} to ${status}. Follow the application flow.`);
      return;
    }

    if (status === 'rejected' && newStatus !== 'rejected') {
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
        oldStatus: currentStatus,
        newStatus,
      });

      // Prepare offer details
      let offerDetailsString = '';
      if (newStatus === 'offer') {
        try {
          offerDetailsString = JSON.stringify(offerDetails);
        } catch (err) {
          setError('Failed to save offer details');
          logError('Offer details stringify failed', err);
          return;
        }
      }

      // Update with lowercase status value
      const success = await updateApplication(application.id, {
        status: newStatus as ApplicationStatus, // lowercase value
        applied_date: appliedDate || undefined,
        interview_date: interviewDate || undefined,
        offer_date: offerDate || undefined,
        rejected_date: rejectedDate || undefined,
        reason_for_rejection: newStatus === 'rejected' ? rejectionReason : undefined,
        offer_details: offerDetailsString || undefined,
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

  const isStatusChanged = newStatus !== currentStatus;
  const canSave = isStatusChanged && !loading;

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
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="font-medium capitalize">{currentStatus}</span>
            </div>
          </div>

          {/* New Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {ALL_STATUSES.map((status) => {
                const allowed = isStatusAllowed(status.value);
                const isSelected = newStatus === status.value;
                const isCurrent = currentStatus === status.value;

                return (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={!allowed || isCurrent}
                    className={`py-3 px-2 rounded-lg font-medium text-sm transition ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                        : allowed && !isCurrent
                        ? `bg-gray-100 ${getStatusColor(status.value)} hover:bg-gray-200 cursor-pointer`
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                    title={
                      isCurrent
                        ? 'Current status'
                        : !allowed
                        ? `Cannot transition to ${status.label}`
                        : `Change to ${status.label}`
                    }
                  >
                    <span className="text-xl">{status.emoji}</span>
                    <br />
                    <span className="text-xs">{status.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {getAllowedStatuses().length > 0 ? (
                <>
                  Next steps: {getAllowedStatuses().map((s) => ALL_STATUSES.find((st) => st.value === s)?.label).join(', ')}
                </>
              ) : (
                'No valid transitions available'
              )}
            </p>
          </div>

          {/* Rejection Confirmation */}
          {showConfirmReject && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm font-medium text-orange-900 mb-3">
                ⚠️ Are you sure you want to reject this application?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setNewStatus(currentStatus);
                    setShowConfirmReject(false);
                    setError('');
                  }}
                  className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition"
                >
                  Cancel
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

          {/* Rejection Details */}
          {newStatus === 'rejected' && !showConfirmReject && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
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

          {/* Offer Details */}
          {newStatus === 'offer' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <label className="block text-sm font-medium text-green-900 mb-2">
                Offer Details
              </label>
              <OfferModal offerDetails={offerDetails} onDetailsChange={setOfferDetails} />
            </div>
          )}

          {/* Date Pickers */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            {/* Applied Date */}
            {newStatus !== 'saved' && (
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
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Interview Date */}
            {['interview', 'offer', 'rejected'].includes(newStatus) && (
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
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Offer Date */}
            {newStatus === 'offer' && (
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
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            {/* Rejected Date */}
            {newStatus === 'rejected' && (
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
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50"
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