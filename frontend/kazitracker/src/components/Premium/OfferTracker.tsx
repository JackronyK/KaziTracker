// src/components/applications/OfferTracker.tsx
// PRODUCTION-READY VERSION with Currency & Salary Frequency

import { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import type { Offer } from '../../types/Premium';
import type { UseOffersReturn } from '../../hooks/useOffers';
import type { useToast } from '../../hooks/useToast';
import { ApplicationSelector } from '../ui/ApplicationSelector';
import type { Application } from '../ui/ApplicationSelector';
import { apiClient } from '../../api/index';

interface OfferTrackerProps extends UseOffersReturn {
  toast: ReturnType<typeof useToast>;
}

// ✅ Currency options with symbols
const CURRENCIES = [
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
];

// ✅ Salary frequency options
const SALARY_FREQUENCIES = [
  { value: 'monthly', label: 'Per Month' },
  { value: 'annual', label: 'Per Year' },
];

// ✅ Helper function to get currency symbol
const getCurrencySymbol = (code: string): string => {
  return CURRENCIES.find(c => c.code === code)?.symbol || code;
};

// ✅ Helper function to format salary with currency
const formatSalary = (amount: number, currency: string, frequency: string): string => {
  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toLocaleString();
  const freq = frequency === 'annual' ? '/year' : '/month';
  return `${symbol} ${formatted}${freq}`;
};

export const OfferTracker = ({
  offers,
  operationLoading,
  addOffer,
  updateOffer,
  deleteOffer,
  updateOfferStatus,
  addNegotiationEntry,
  toast,
}: OfferTrackerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showNegotiationModal, setShowNegotiationModal] = useState<Offer | null>(null);
  const [negotiationProposal, setNegotiationProposal] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await apiClient.listApplications();        
        setApplications(data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      }
    };
    fetchApplications();
  }, []);

  const emptyForm = {
    applicationId: 0,
    companyName: '',
    position: '',
    salary: 0,
    currency: 'KES', // ✅ Default to Kenyan Shilling
    salaryFrequency: 'monthly' as 'monthly' | 'annual', // ✅ Default to monthly
    benefits: [] as string[],
    startDate: '',
    deadline: '',
    status: 'pending' as 'pending' | 'accepted' | 'rejected' | 'negotiating',
    notes: '', // ✅ Added notes field
  };

  const [formData, setFormData] = useState(emptyForm);
  const [benefitInput, setBenefitInput] = useState('');

  const handleOpenForm = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      
      // Parse benefits if it's a string
      let benefits = [];
      const rawBenefits = (offer as any).benefits;
      if (typeof rawBenefits === 'string') {
        try {
          benefits = JSON.parse(rawBenefits);
        } catch (e) {
          benefits = [];
        }
      } else if (Array.isArray(rawBenefits)) {
        benefits = rawBenefits;
      }

      setFormData({
        applicationId: (offer as any).application_id || (offer as any).applicationId || 0,
        companyName: (offer as any).company_name || (offer as any).companyName || '',
        position: (offer as any).position || '',
        salary: (offer as any).salary || 0,
        currency: (offer as any).currency || 'KES',
        salaryFrequency: (offer as any).salary_frequency || (offer as any).salaryFrequency || 'monthly',
        benefits: benefits,
        startDate: (offer as any).start_date || (offer as any).startDate || '',
        deadline: (offer as any).deadline || '',
        status: (offer as any).status || 'pending',
        notes: (offer as any).notes || '',
      });
    } else {
      setEditingOffer(null);
      setFormData(emptyForm);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOffer(null);
    setFormData(emptyForm);
    setBenefitInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Enhanced validation
    if (formData.applicationId === 0) {
      toast.error('Validation Error', 'Please select an application');
      return;
    }

    if (!formData.companyName || !formData.position) {
      toast.error('Validation Error', 'Company and position are required');
      return;
    }

    if (!formData.salary || formData.salary <= 0) {
      toast.error('Validation Error', 'Please enter a valid salary amount');
      return;
    }

    if (!formData.startDate || !formData.deadline) {
      toast.error('Validation Error', 'Start date and deadline are required');
      return;
    }

    // ✅ Check deadline is after today
    const deadlineDate = new Date(formData.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadlineDate < today && !editingOffer) {
      toast.warning('Past Deadline', 'Deadline is in the past. Are you sure?');
    }

    if (editingOffer) {
      const result = await updateOffer(editingOffer.id, formData as any);
      if (result) {
        toast.success('Offer Updated', 'Your offer has been updated successfully');
        handleCloseForm();
      }
    } else {
      const result = await addOffer(formData as any);
      if (result) {
        toast.success('Offer Added', 'Your offer has been added successfully');
        handleCloseForm();
      }
    }
  };

  const handleDelete = async (id: number) => {
    const result = await deleteOffer(id);
    if (result) {
      toast.success('Offer Deleted', 'Offer has been removed');
      setShowDeleteConfirm(null);
    }
  };

  const handleStatusUpdate = async (
    id: number,
    status: 'pending' | 'accepted' | 'rejected' | 'negotiating'
  ) => {
    const result = await updateOfferStatus(id, status);
    if (result) {
      toast.success('Status Updated', `Offer marked as ${status}`);
    }
  };

  const handleAddNegotiation = async () => {
    if (!negotiationProposal.trim() || !showNegotiationModal) return;

    const result = await addNegotiationEntry(showNegotiationModal.id, negotiationProposal);
    if (result) {
      toast.success('Negotiation Added', 'Your negotiation entry has been recorded');
      setShowNegotiationModal(null);
      setNegotiationProposal('');
    }
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, benefitInput.trim()],
      });
      setBenefitInput('');
    }
  };

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  const getDaysUntilDeadline = (deadline: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDeadlineColor = (days: number): string => {
    if (days < 0) return 'text-gray-500';
    if (days === 0) return 'text-red-600 font-bold';
    if (days <= 3) return 'text-orange-600 font-bold';
    return 'text-green-600';
  };

  const getApplicationName = (applicationId: number): string => {
    if (!Array.isArray(applications) || applications.length === 0) {
      return 'Unknown Application';
    }

    const app = applications.find(a => a.id === applicationId);
    if (!app) return 'Unknown Application';

    const companyName = 
      app.company?.name || app.companyName || (app as any).company_name || 'Unknown Company';
    const jobTitle = app.job_title || (app as any).position || 'Unknown Position';

    return `${companyName} - ${jobTitle}`;
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    negotiating: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Offer Tracker</h2>
        </div>
        <button
          onClick={() => handleOpenForm()}
          disabled={operationLoading.create}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Offer
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {['pending', 'negotiating', 'accepted', 'rejected'].map((status) => (
          <div
            key={status}
            className={`p-4 rounded-lg ${
              status === 'pending' ? 'bg-blue-50' :
              status === 'negotiating' ? 'bg-orange-50' :
              status === 'accepted' ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <p className="text-gray-600 text-sm capitalize">{status}</p>
            <p className={`text-2xl font-bold ${
              status === 'pending' ? 'text-blue-600' :
              status === 'negotiating' ? 'text-orange-600' :
              status === 'accepted' ? 'text-green-600' : 'text-red-600'
            }`}>
              {offers.filter((o) => o.status === status).length}
            </p>
          </div>
        ))}
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offers.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No offers yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first job offer to track</p>
          </div>
        ) : (
          offers.map((offer) => {
            const daysUntil = getDaysUntilDeadline((offer as any).deadline);
            
            // Parse negotiation history
            let negotiationHistory = [];
            const rawHistory = (offer as any).negotiationHistory || (offer as any).negotiation_history;
            if (typeof rawHistory === 'string') {
              try {
                negotiationHistory = JSON.parse(rawHistory);
              } catch (e) {
                negotiationHistory = [];
              }
            } else if (Array.isArray(rawHistory)) {
              negotiationHistory = rawHistory;
            }

            // Parse benefits
            let benefits = [];
            const rawBenefits = (offer as any).benefits;
            if (typeof rawBenefits === 'string') {
              try {
                benefits = JSON.parse(rawBenefits);
              } catch (e) {
                benefits = [];
              }
            } else if (Array.isArray(rawBenefits)) {
              benefits = rawBenefits;
            }

            const applicationId = (offer as any).application_id || (offer as any).applicationId;
            const applicationName = getApplicationName(applicationId);
            
            // ✅ Extract currency and frequency
            const currency = (offer as any).currency || 'KES';
            const frequency = (offer as any).salary_frequency || (offer as any).salaryFrequency || 'monthly';
            const salary = (offer as any).salary || 0;

            return (
              <div
                key={offer.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">
                        {(offer as any).companyName || (offer as any).company_name}
                      </h3>
                      <p className="text-sm text-gray-600">{(offer as any).position}</p>
                      <p className="text-xs text-gray-500 mt-1">{applicationName}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenForm(offer)}
                        disabled={operationLoading.update}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(offer.id)}
                        disabled={operationLoading.delete}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[offer.status]}`}>
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </span>

                  {/* ✅ Salary with Currency & Frequency */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded mt-3 border border-green-200">
                    <p className="text-gray-600 text-xs font-medium">Salary</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatSalary(salary, currency, frequency)}
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                {benefits.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Benefits</p>
                    <div className="flex flex-wrap gap-1">
                      {benefits.map((benefit: string, idx: number) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">
                      {new Date((offer as any).startDate || (offer as any).start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Respond By:</span>
                    <span className={`font-medium ${getDeadlineColor(daysUntil)}`}>
                      {daysUntil < 0 ? 'Deadline Passed' : daysUntil === 0 ? 'Today!' : `${daysUntil} days`}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {(offer as any).notes && (
                  <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
                    <p className="text-gray-700 italic">"{(offer as any).notes}"</p>
                  </div>
                )}

                {/* Negotiation History */}
                {negotiationHistory.length > 0 && (
                  <div className="mb-4 bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                    <p className="font-medium text-gray-700 mb-2">Negotiation History</p>
                    <div className="space-y-1">
                      {negotiationHistory.map((entry: any, idx: number) => (
                        <p key={idx} className="text-xs text-gray-600">
                          <span className="font-medium">{new Date(entry.date).toLocaleDateString()}:</span> {entry.proposal}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {offer.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(offer.id, 'accepted')}
                      disabled={operationLoading.update}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setShowNegotiationModal(offer)}
                      disabled={operationLoading.update}
                      className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm font-medium disabled:opacity-50"
                    >
                      Negotiate
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(offer.id, 'rejected')}
                      disabled={operationLoading.update}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm === offer.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800 mb-2">Delete this offer?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(offer.id)}
                        disabled={operationLoading.delete}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingOffer ? 'Edit Offer' : 'Add New Offer'}
              </h3>
              <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Application Selector */}
              <ApplicationSelector
                value={formData.applicationId}
                onChange={(id) => setFormData({ ...formData, applicationId: id })}
                required
                error={formData.applicationId === 0 ? 'Application is required' : undefined}
                applications={applications}
              />

              {/* Company & Position */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    placeholder="e.g., TechCorp"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                    placeholder="e.g., Senior Developer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* ✅ Salary with Currency & Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Details *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Amount */}
                  <div className="col-span-3 md:col-span-1">
                    <input
                      type="number"
                      value={formData.salary || ''}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                      required
                      min="0"
                      placeholder="Amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Currency */}
                  <div className="col-span-3 md:col-span-1">
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    <select
                      value={formData.salaryFrequency}
                      onChange={(e) => setFormData({ ...formData, salaryFrequency: e.target.value as 'monthly' | 'annual' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {SALARY_FREQUENCIES.map((freq) => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Preview */}
                {formData.salary > 0 && (
                  <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Preview: <span className="font-semibold text-green-700">
                      {formatSalary(formData.salary, formData.currency, formData.salaryFrequency)}
                    </span>
                  </p>
                )}
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Benefits
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    placeholder="e.g., Health Insurance"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Response Deadline *
                    {formData.deadline && getDaysUntilDeadline(formData.deadline) < 0 && (
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                    )}
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* ✅ Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes about this offer..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={operationLoading.create || operationLoading.update}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {operationLoading.create || operationLoading.update
                    ? editingOffer ? 'Updating...' : 'Adding...'
                    : editingOffer ? 'Update Offer' : 'Add Offer'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Negotiation Modal */}
      {showNegotiationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Negotiation Entry</h3>
            <textarea
              value={negotiationProposal}
              onChange={(e) => setNegotiationProposal(e.target.value)}
              placeholder="e.g., Requested KSh 50,000 increase for better alignment with market rate..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddNegotiation}
                disabled={operationLoading.update || !negotiationProposal.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
              >
                {operationLoading.update ? 'Adding...' : 'Add Entry'}
              </button>
              <button
                onClick={() => {
                  setShowNegotiationModal(null);
                  setNegotiationProposal('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};