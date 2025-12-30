// src/components/applications/RejectionModal.tsx

/**
 * RejectionModal Component (Phase 7)
 * Capture rejection reason when application is rejected
 */

import { useState } from 'react';

interface RejectionModalProps {
  rejectionReason: string;
  onReasonChange: (reason: string) => void;
}

/**
 * Rejection reasons from common patterns
 */
const REJECTION_REASONS = [
  {
    value: 'Overqualified',
    label: '📚 Overqualified',
    description: 'You have too much experience for the role',
  },
  {
    value: 'Underqualified',
    label: '🎓 Underqualified',
    description: 'You lack specific skills or experience',
  },
  {
    value: 'Budget constraints',
    label: '💰 Budget Constraints',
    description: 'Your salary expectations exceed their budget',
  },
  {
    value: 'Different priorities',
    label: '🎯 Different Priorities',
    description: 'Your goals don\'t align with the role',
  },
  {
    value: 'Culture fit',
    label: '🤝 Culture Fit',
    description: 'Didn\'t match team culture',
  },
  {
    value: 'Already filled',
    label: '✅ Already Filled',
    description: 'Position was filled by another candidate',
  },
  {
    value: 'No feedback',
    label: '🤐 No Feedback',
    description: 'No reason provided',
  },
  {
    value: 'Other',
    label: '📝 Other',
    description: 'Different reason (add in notes)',
  },
];

export const RejectionModal = ({
  rejectionReason,
  onReasonChange,
}: RejectionModalProps) => {
  const [customReason, setCustomReason] = useState('');

  return (
    <div>
      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>❌</span>
        What was the rejection reason?
      </h4>

      <p className="text-sm text-gray-600 mb-4">
        Understanding why you were rejected helps you improve for future applications.
      </p>

      {/* Rejection Reason Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {REJECTION_REASONS.map((reason) => (
          <button
            key={reason.value}
            onClick={() => {
              onReasonChange(reason.value);
              setCustomReason('');
            }}
            className={`p-3 rounded-lg border-2 transition text-left ${
              rejectionReason === reason.value
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="font-semibold text-gray-900">{reason.label}</div>
            <div className="text-xs text-gray-600">{reason.description}</div>
          </button>
        ))}
      </div>

      {/* Custom Reason Input */}
      {rejectionReason === 'Other' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Please describe the reason
          </label>
          <textarea
            value={customReason}
            onChange={(e) => {
              setCustomReason(e.target.value);
              onReasonChange(`Other: ${e.target.value}`);
            }}
            placeholder="Why do you think you were rejected?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none h-20 text-sm"
          />
        </div>
      )}

      {/* Learning Resources */}
      {rejectionReason && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-semibold text-yellow-900 mb-2">💡 Tips to improve:</p>

          {rejectionReason === 'Overqualified' && (
            <p className="text-sm text-yellow-800">
              Tailor your resume to highlight only relevant experience. Consider roles that better match your career goals.
            </p>
          )}

          {rejectionReason === 'Underqualified' && (
            <p className="text-sm text-yellow-800">
              Build the missing skills through courses or projects. Consider applying to mid-level roles instead.
            </p>
          )}

          {rejectionReason === 'Budget constraints' && (
            <p className="text-sm text-yellow-800">
              Be flexible with salary negotiation. Research market rates and consider benefits beyond salary.
            </p>
          )}

          {rejectionReason === 'Different priorities' && (
            <p className="text-sm text-yellow-800">
              Read job descriptions carefully. Ensure your goals align with the role before applying.
            </p>
          )}

          {rejectionReason === 'Culture fit' && (
            <p className="text-sm text-yellow-800">
              Research company culture during interviews. Ask questions about team dynamics and values.
            </p>
          )}

          {rejectionReason === 'Already filled' && (
            <p className="text-sm text-yellow-800">
              This happens! Keep applying. Consider asking for feedback or opportunities for future roles.
            </p>
          )}

          {rejectionReason === 'No feedback' && (
            <p className="text-sm text-yellow-800">
              Try to get feedback from the recruiter. This will help you improve for next time.
            </p>
          )}
        </div>
      )}

      {/* Selected Summary */}
      {rejectionReason && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <span className="font-semibold">Selected:</span> {rejectionReason}
          </p>
        </div>
      )}
    </div>
  );
};

export default RejectionModal;