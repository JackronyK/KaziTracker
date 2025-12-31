// src/components/applications/RejectionModal.tsx
/**
 * OfferModal Component (Phase 7)
 * Capture offer details when application receives an offer
 */

import { useState } from 'react';

interface OfferDetails {
  salary?: string;
  currency?: string;
  start_date?: string;
  position_type?: string;
  location?: string;
  benefits?: string[];
  notes?: string;
}

interface OfferModalProps {
  offerDetails: OfferDetails;
  onDetailsChange: (details: OfferDetails) => void;
}

const POSITION_TYPES = [
  { value: 'Full-time', label: '💼 Full-time' },
  { value: 'Part-time', label: '⏰ Part-time' },
  { value: 'Contract', label: '📋 Contract' },
  { value: 'Freelance', label: '🎨 Freelance' },
  { value: 'Internship', label: '📚 Internship' },
];

const LOCATION_TYPES = [
  { value: 'On-site', label: '🏢 On-site' },
  { value: 'Remote', label: '🏠 Remote' },
  { value: 'Hybrid', label: '🔄 Hybrid' },
];

const BENEFIT_OPTIONS = [
  { value: 'Health insurance', label: '🏥 Health Insurance' },
  { value: '401k', label: '💳 401k' },
  { value: 'Dental', label: '🦷 Dental' },
  { value: 'Vision', label: '👀 Vision' },
  { value: 'Stock options', label: '📈 Stock Options' },
  { value: 'Bonus', label: '💰 Bonus' },
  { value: 'Paid time off', label: '✈️ Paid Time Off' },
  { value: 'Remote work', label: '🏠 Remote Work' },
  { value: 'Professional development', label: '🎓 Professional Development' },
  { value: 'Gym membership', label: '🏋️ Gym Membership' },
];

export const OfferModal = ({
  offerDetails,
  onDetailsChange,
}: OfferModalProps) => {
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(
    offerDetails.benefits || []
  );

  const handleBenefitToggle = (benefit: string) => {
    const updated = selectedBenefits.includes(benefit)
      ? selectedBenefits.filter((b) => b !== benefit)
      : [...selectedBenefits, benefit];
    setSelectedBenefits(updated);
    onDetailsChange({ ...offerDetails, benefits: updated });
  };

  return (
    <div>
      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>🎉</span>
        Congratulations! Document your offer
      </h4>

      <p className="text-sm text-gray-600 mb-4">
        Record all offer details to compare multiple offers and negotiate better.
      </p>

      {/* Salary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            💰 Base Salary
          </label>
          <input
            type="text"
            value={offerDetails.salary || ''}
            onChange={(e) =>
              onDetailsChange({ ...offerDetails, salary: e.target.value })
            }
            placeholder="e.g., 120000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={offerDetails.currency || 'USD'}
            onChange={(e) =>
              onDetailsChange({ ...offerDetails, currency: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option>USD</option>
            <option>Kshs</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>CAD</option>
            <option>AUD</option>
            <option>INR</option>
          </select>
        </div>
      </div>

      {/* Position Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Position Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {POSITION_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() =>
                onDetailsChange({ ...offerDetails, position_type: type.value })
              }
              className={`p-2 rounded-lg border-2 transition text-sm font-medium ${
                offerDetails.position_type === type.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Location
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LOCATION_TYPES.map((loc) => (
            <button
              key={loc.value}
              onClick={() =>
                onDetailsChange({ ...offerDetails, location: loc.value })
              }
              className={`p-2 rounded-lg border-2 transition text-sm font-medium ${
                offerDetails.location === loc.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📅 Start Date
        </label>
        <input
          type="date"
          value={offerDetails.start_date || ''}
          onChange={(e) =>
            onDetailsChange({ ...offerDetails, start_date: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Benefits */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Benefits Offered
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BENEFIT_OPTIONS.map((benefit) => (
            <label
              key={benefit.value}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedBenefits.includes(benefit.value)}
                onChange={() => handleBenefitToggle(benefit.value)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">{benefit.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          value={offerDetails.notes || ''}
          onChange={(e) =>
            onDetailsChange({ ...offerDetails, notes: e.target.value })
          }
          placeholder="Any other offer details (e.g., signing bonus, stock options, etc.)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-20 text-sm"
        />
      </div>

      {/* Offer Summary */}
      {offerDetails.salary && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-900 mb-2">
            💼 Offer Summary
          </p>
          <div className="text-sm text-green-800 space-y-1">
            <p>
              💰 <span className="font-semibold">{offerDetails.salary}</span> {offerDetails.currency || 'USD'} - {offerDetails.position_type}
            </p>
            {offerDetails.start_date && (
              <p>
                📅 Starting: <span className="font-semibold">{offerDetails.start_date}</span>
              </p>
            )}
            {offerDetails.location && (
              <p>
                📍 Location: <span className="font-semibold">{offerDetails.location}</span>
              </p>
            )}
            {selectedBenefits.length > 0 && (
              <p>
                ✨ Benefits: <span className="font-semibold">{selectedBenefits.length} included</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferModal;