// src/components/Premium/OfferModal.tsx
/**
 * Enhanced OfferModal Component - Production Ready
 * Unified offer details capture for both UpdateStatusModal and OfferTracker
 */

import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { CURRENCIES, SALARY_FREQUENCIES, BENEFIT_OPTIONS, POSITION_TYPES, LOCATION_TYPES } from '../../constants/premium/offer';

interface OfferDetails {
  salary?: string | number;
  currency?: string;
  salary_frequency?: 'monthly' | 'annual';
  position_type?: string;
  location?: string;
  start_date?: string;
  benefits?: string[];
  notes?: string;
}

interface OfferModalProps {
  offerDetails: OfferDetails;
  onDetailsChange: (details: OfferDetails) => void;
  compact?: boolean; // If true, use compact view for UpdateStatusModal
}


// ✅ Helper function to get currency symbol
const getCurrencySymbol = (code: string): string => {
  return CURRENCIES.find(c => c.code === code)?.symbol || code;
};

// ✅ Helper function to format salary
const formatSalary = (amount: string | number, currency: string, frequency: string): string => {
  if (!amount || Number(amount) === 0) return '';
  
  const symbol = getCurrencySymbol(currency || 'KES');
  const num = Number(amount);
  const formatted = num.toLocaleString();
  const freq = frequency === 'annual' ? '/year' : '/month';
  return `${symbol} ${formatted}${freq}`;
};

export const OfferModal = ({
  offerDetails,
  onDetailsChange,
  compact = false,
}: OfferModalProps) => {
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(
    offerDetails.benefits || []
  );
  const [benefitInput, setBenefitInput] = useState('');

  // ✅ Handle benefit toggle
  const handleBenefitToggle = (benefit: string) => {
    const updated = selectedBenefits.includes(benefit)
      ? selectedBenefits.filter((b) => b !== benefit)
      : [...selectedBenefits, benefit];
    setSelectedBenefits(updated);
    onDetailsChange({ ...offerDetails, benefits: updated });
  };

  // ✅ Add custom benefit
  const addCustomBenefit = () => {
    if (benefitInput.trim() && !selectedBenefits.includes(benefitInput.trim())) {
      const updated = [...selectedBenefits, benefitInput.trim()];
      setSelectedBenefits(updated);
      onDetailsChange({ ...offerDetails, benefits: updated });
      setBenefitInput('');
    }
  };

  // ✅ Remove benefit
  const removeBenefit = (benefit: string) => {
    const updated = selectedBenefits.filter((b) => b !== benefit);
    setSelectedBenefits(updated);
    onDetailsChange({ ...offerDetails, benefits: updated });
  };

  const salary = Number(offerDetails.salary) || 0;
  const currency = offerDetails.currency || 'KES';
  const frequency = offerDetails.salary_frequency || 'monthly';

  return (
    <div className="space-y-4">
      {!compact && (
        <>
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🎉</span>
            Congratulations! Document your offer
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Record all offer details to compare multiple offers and negotiate better.
          </p>
        </>
      )}

      {/* ✅ SALARY SECTION - Enhanced with Currency & Frequency */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          Salary Details
        </h5>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Amount */}
          <div className="col-span-3 md:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              value={offerDetails.salary || ''}
              onChange={(e) =>
                onDetailsChange({ ...offerDetails, salary: e.target.value })
              }
              placeholder="e.g., 150000"
              min="0"
              className="w-full px-3 py-2 border border-green-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Currency */}
          <div className="col-span-3 md:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) =>
                onDetailsChange({ ...offerDetails, currency: e.target.value })
              }
              className="w-full px-3 py-2 border border-green-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Frequency */}
          <div className="col-span-3 md:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) =>
                onDetailsChange({
                  ...offerDetails,
                  salary_frequency: e.target.value as 'monthly' | 'annual',
                })
              }
              className="w-full px-3 py-2 border border-green-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {SALARY_FREQUENCIES.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Salary Preview */}
        {salary > 0 && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-sm font-semibold text-green-900">
              💰 {formatSalary(salary, currency, frequency)}
            </p>
          </div>
        )}
      </div>

      {/* ✅ POSITION & LOCATION */}
      <div className="grid grid-cols-2 gap-4">
        {/* Position Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {POSITION_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() =>
                  onDetailsChange({ ...offerDetails, position_type: type.value })
                }
                className={`p-2 rounded-lg border-2 transition text-xs font-medium text-center ${
                  offerDetails.position_type === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
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
                className={`p-2 rounded-lg border-2 transition text-xs font-medium text-center ${
                  offerDetails.location === loc.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ START DATE */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📅 Start Date
        </label>
        <input
          type="date"
          value={offerDetails.start_date || ''}
          onChange={(e) =>
            onDetailsChange({ ...offerDetails, start_date: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ✅ BENEFITS SECTION */}
      <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
        <h5 className="font-semibold text-gray-900 mb-3">
          ✨ Benefits Offered
        </h5>

        {/* Preset Benefits Checkboxes */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {BENEFIT_OPTIONS.map((benefit) => (
            <label
              key={benefit.value}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 cursor-pointer transition"
            >
              <input
                type="checkbox"
                checked={selectedBenefits.includes(benefit.value)}
                onChange={() => handleBenefitToggle(benefit.value)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
              <span className="text-sm text-gray-700">{benefit.label}</span>
            </label>
          ))}
        </div>

        {/* Custom Benefit Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={benefitInput}
            onChange={(e) => setBenefitInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomBenefit())}
            placeholder="Add custom benefit..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={addCustomBenefit}
            disabled={!benefitInput.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition"
          >
            Add
          </button>
        </div>

        {/* Selected Benefits Display */}
        {selectedBenefits.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedBenefits.map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-200 text-blue-700 rounded-full text-xs font-medium"
              >
                {benefit}
                <button
                  onClick={() => removeBenefit(benefit)}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ✅ NOTES */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          value={offerDetails.notes || ''}
          onChange={(e) =>
            onDetailsChange({ ...offerDetails, notes: e.target.value })
          }
          placeholder="e.g., Signing bonus, stock options, flexible hours, relocation package..."
          rows={compact ? 2 : 3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
        />
      </div>

      {/* ✅ OFFER SUMMARY */}
      {salary > 0 && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
          <p className="text-sm font-semibold text-green-900 mb-3">
            💼 Offer Summary
          </p>
          <div className="text-sm text-green-800 space-y-1">
            <p>
              💰 <span className="font-semibold">{formatSalary(salary, currency, frequency)}</span>
            </p>
            {offerDetails.position_type && (
              <p>
                💼 <span className="font-semibold">{offerDetails.position_type}</span>
              </p>
            )}
            {offerDetails.start_date && (
              <p>
                📅 Starting: <span className="font-semibold">
                  {new Date(offerDetails.start_date).toLocaleDateString()}
                </span>
              </p>
            )}
            {offerDetails.location && (
              <p>
                📍 <span className="font-semibold">{offerDetails.location}</span>
              </p>
            )}
            {selectedBenefits.length > 0 && (
              <p>
                ✨ <span className="font-semibold">{selectedBenefits.length} benefits included</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferModal;