// src/components/Jobs/AddJobModal.tsx

/**
 * AddJobModal Component - FIXED VERSION
 * Includes description field and proper initialData handling
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useJobs } from '../../hooks/useJobs';
import type { JobInput } from '../../types';
import { logInfo, logError } from '../../utils/errorLogger';

interface AddJobModalProps {
  onClose: () => void;
  onJobAdded: () => void;
  initialData?: JobInput | null;
}

export const AddJobModal = ({ onClose, onJobAdded, initialData }: AddJobModalProps) => {
  const { createJob, loading } = useJobs();

  // Initialize form with prefilled data or empty values
  const [formData, setFormData] = useState<JobInput>({
    title: '',
    company: '',
    location: '',
    salary_range: '',
    description: '',          // ✅ Now included!
    apply_url: '',
    experience_required: '',  // ✅ Added
    tech_stack: '',           // ✅ Added
    parsed_skills: '',
    seniority_level: 'mid',
    source: 'manual',
  });

  const [error, setError] = useState('');
  const [isParsed, setIsParsed] = useState(false);

  // Update form when initialData changes (from AI parser)
  useEffect(() => {
    if (initialData) {
      logInfo('Prefilling form with parsed data', initialData);
      
      setFormData({
        title: initialData.title || '',
        company: initialData.company || '',
        location: initialData.location || '',
        salary_range: initialData.salary_range || '',
        description: initialData.description || '',
        apply_url: initialData.apply_url || '',
        experience_required: initialData.experience_required || '',
        tech_stack: initialData.tech_stack || '',
        parsed_skills: initialData.parsed_skills || '',
        seniority_level: initialData.seniority_level || 'mid',
        source: initialData.source || 'parsed',
      });
      
      setIsParsed(true);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!formData.company.trim()) {
      setError('Company name is required');
      return;
    }

    // ✅ CRITICAL FIX: Always send description (even if empty)
    const jobData: JobInput = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      location: formData.location?.trim() || '',
      salary_range: formData.salary_range?.trim() || '',
      description: formData.description?.trim() || '',  // ✅ Always include
      apply_url: formData.apply_url?.trim() || '',
      experience_required: formData.experience_required?.trim() || '',
      tech_stack: formData.tech_stack?.trim() || '',
      parsed_skills: formData.parsed_skills?.trim() || '',
      seniority_level: formData.seniority_level,
      source: formData.source,
    };

    logInfo('Creating job with complete data', jobData);

    const result = await createJob(jobData);

    if (result) {
      logInfo('Job created successfully', { jobId: result.id });
      onJobAdded();
    } else {
      setError('Failed to create job. Please try again.');
      logError('Job creation failed', new Error('Create job returned null'));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isParsed ? '✨ Review Parsed Job' : 'Add New Job'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isParsed 
                ? 'Review and edit the AI-extracted details before saving'
                : 'Fill in the job details manually'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success Banner for Parsed Jobs */}
          {isParsed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Job details extracted successfully!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Review the fields below and edit if needed before saving.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g., Google"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Nairobi, Kenya"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Seniority Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seniority Level
              </label>
              <select
                name="seniority_level"
                value={formData.seniority_level}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary Range
            </label>
            <input
              type="text"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="e.g., KSh 200,000 - 350,000 or $120k - $180k"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* ✅ CRITICAL: Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter job description, requirements, responsibilities..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Add job details for better tracking
            </p>
          </div>

          {/* Application URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application URL
            </label>
            <input
              type="url"
              name="apply_url"
              value={formData.apply_url}
              onChange={handleChange}
              placeholder="https://company.com/careers/job-123"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Experience Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Required
              </label>
              <input
                type="text"
                name="experience_required"
                value={formData.experience_required}
                onChange={handleChange}
                placeholder="e.g., 3-5 years"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tech Stack
              </label>
              <input
                type="text"
                name="tech_stack"
                value={formData.tech_stack}
                onChange={handleChange}
                placeholder="e.g., Python, React, AWS"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Parsed Skills (if from AI) */}
          {isParsed && formData.parsed_skills && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Extracted Skills
              </label>
              <input
                type="text"
                name="parsed_skills"
                value={formData.parsed_skills}
                onChange={handleChange}
                placeholder="Skills extracted by AI"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-blue-50"
              />
              <p className="text-xs text-blue-600 mt-1">
                ✨ These skills were extracted by AI
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobModal;