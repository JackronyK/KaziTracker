// src/components/jobs/EditJobModal.tsx
/**
 * EditJobModal Component
 * Modal for editing existing jobs
 */

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import type { Job } from '../../types/index';
import { logInfo, logError } from '../../utils/errorLogger';
import type { EditJobFormData, SeniorityLevel } from '../../types/index';

interface EditJobModalProps {
  job: Job;
  onClose: () => void;
  onJobUpdated: () => void;
}

/**
 * EditJobModal Component
 * 
 * Props:
 * - job: Job object to edit
 * - onClose: Callback to close modal
 * - onJobUpdated: Callback after job updated
 * 
 * Features:
 * - Pre-filled form with current values
 * - Edit all job fields
 * - Validation before save
 * - Error handling
 * - Loading state
 */
export const EditJobModal = ({
  job,
  onClose,
  onJobUpdated,
}: EditJobModalProps) => {
  const { updateJob, loading } = useJobs();

  // State - initialize with current job values
  const [formData, setFormData] = useState<EditJobFormData>({
    title: job.title,
    company: job.company,
    location: job.location || '',
    salary_range: job.salary_range || '',
    experience_required: job.experience_required || '',
    seniority_level: job.seniority_level || ('Mid' as SeniorityLevel),
    tech_stack: job.tech_stack || [],
    description: job.description || '',
    application_link: job.apply_url || '',
  });

  const [newTech, setNewTech] = useState('');
  const [error, setError] = useState('');

  // Handle input change
  const handleChange = (
    field: string,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add tech to stack
  const addTech = () => {
    if (newTech.trim() && !formData.tech_stack.includes(newTech.trim())) {
      setFormData((prev) => ({
        ...prev,
        tech_stack: [...prev.tech_stack, newTech.trim()],
      }));
      setNewTech('');
    }
  };

  // Remove tech from stack
  const removeTech = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((_, i) => i !== idx),
    }));
  };

  // Handle save
  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!formData.company.trim()) {
      setError('Company name is required');
      return;
    }

    try {
      setError('');
      logInfo('Updating job', { jobId: job.id });

      const success = await updateJob(job.id, {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        salary_range: formData.salary_range,
        experience_required: formData.experience_required,
        seniority_level: formData.seniority_level as SeniorityLevel,
        tech_stack: formData.tech_stack.join(','),
        description: formData.description,
        apply_url: formData.application_link,
      });

      if (success) {
        logInfo('Job updated successfully');
        onJobUpdated();
      } else {
        setError('Failed to update job. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      logError('Job update failed', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Edit Job</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary Range
              </label>
              <input
                type="text"
                value={formData.salary_range}
                onChange={(e) => handleChange('salary_range', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Required
              </label>
              <input
                type="text"
                value={formData.experience_required}
                onChange={(e) =>
                  handleChange('experience_required', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Seniority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seniority Level
              </label>
              <select
                value={formData.seniority_level}
                onChange={(e) => handleChange('seniority_level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Junior</option>
                <option>Mid</option>
                <option>Senior</option>
                <option>Lead</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
          </div>

          {/* Application Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Link
            </label>
            <input
              type="url"
              value={formData.application_link}
              onChange={(e) => handleChange('application_link', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tech Stack
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="Add technology..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={addTech}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition text-sm"
              >
                Add
              </button>
            </div>

            {formData.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tech_stack.map((tech, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tech}
                    <button
                      onClick={() => removeTech(idx)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditJobModal;


