// src/components/applications/OfferTracker.tsx

// ============================================
// 2. OFFER TRACKER
// ============================================


import { useState } from "react";

import {
  DollarSign,
} from 'lucide-react';


import type { Offer } from '../../types/Premium';

export const OfferTracker = () => {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      applicationId: 'app1',
      companyName: 'Tech Corp',
      position: 'Senior Developer',
      salary: 150000,
      benefits: ['Health Insurance', '401k', 'Remote Work'],
      startDate: '2025-03-01',
      deadline: '2025-01-20',
      status: 'pending',
      negotiationHistory: [
        { date: '2025-01-10', proposal: 'Initial offer: $150,000' },
      ],
    },
  ]);

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const getDaysUntilDeadline = (deadline: string): number => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDeadlineColor = (days: number): string => {
    if (days < 0) return 'text-gray-500';
    if (days === 0) return 'text-red-600 font-bold';
    if (days <= 3) return 'text-orange-600 font-bold';
    return 'text-green-600';
  };

  const updateOfferStatus = (offerId: string, status: 'accepted' | 'rejected' | 'negotiating') => {
    setOffers(offers.map((o) => (o.id === offerId ? { ...o, status } : o)));
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    negotiating: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Offer Tracker</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-blue-600">
            {offers.filter((o) => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Negotiating</p>
          <p className="text-2xl font-bold text-orange-600">
            {offers.filter((o) => o.status === 'negotiating').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Accepted</p>
          <p className="text-2xl font-bold text-green-600">
            {offers.filter((o) => o.status === 'accepted').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {offers.filter((o) => o.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.map((offer) => {
          const daysUntil = getDaysUntilDeadline(offer.deadline);

          return (
            <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{offer.companyName}</h3>
                    <p className="text-sm text-gray-600">{offer.position}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[offer.status]}`}>
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </span>
                </div>

                {/* Salary */}
                <div className="bg-gray-50 p-3 rounded mb-3">
                  <p className="text-gray-600 text-xs">Base Salary</p>
                  <p className="text-xl font-bold text-gray-900">${offer.salary.toLocaleString()}</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Benefits</p>
                <div className="flex flex-wrap gap-1">
                  {offer.benefits.map((benefit, idx) => (
                    <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Start Date & Deadline */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">
                    {new Date(offer.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Respond By:</span>
                  <span className={`font-medium ${getDeadlineColor(daysUntil)}`}>
                    {daysUntil < 0
                      ? 'Deadline Passed'
                      : daysUntil === 0
                      ? 'Today!'
                      : `${daysUntil} days`}
                  </span>
                </div>
              </div>

              {/* Negotiation History */}
              {offer.negotiationHistory.length > 0 && (
                <div className="mb-4 bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                  <p className="font-medium text-gray-700 mb-2">Negotiation History</p>
                  <div className="space-y-1">
                    {offer.negotiationHistory.map((entry, idx) => (
                      <p key={idx} className="text-xs text-gray-600">
                        <span className="font-medium">{entry.date}:</span> {entry.proposal}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {offer.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateOfferStatus(offer.id, 'accepted')}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateOfferStatus(offer.id, 'negotiating')}
                      className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm font-medium"
                    >
                      Negotiate
                    </button>
                    <button
                      onClick={() => updateOfferStatus(offer.id, 'rejected')}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {offers.length === 0 && (
        <p className="text-gray-500 text-center py-12">No offers yet</p>
      )}
    </div>
  );
};