// src/components/Jobs/AddjobModal.tsx


/**
 * AddJobModal Component
 * Modal for adding new jobs with smart parsing
 */

import { useState } from 'react';
import { X, Copy, Check, AlertCircle } from 'lucide-react';
import {useJobs } from '../../hooks/useJobs';
import { logInfo, logError } from '../../utils/errorLogger';

interface AddJobModalProps {
    onClose: () => void;
    onJobAdded: () => void;
}


interface ParsedJob {
  title: string;
  company: string;
  location: string;
  salary_range: string;
  experience_required: string;
  seniority_level: string;
  tech_stack: string[];
  description: string;
  application_link: string;
}

/**
 * AddJobModal Component
 * 
 * Props:
 * - onClose: Callback to close modal
 * - onJobAdded: Callback after job added
 * 
 * Features:
 * - Paste job posting text
 * - Smart parser extracts fields
 * - Manual form fallback
 * - Validation before save
 * - Error handling
 * - Loading state
 */
export const AddJobModal = ({ onClose, onJobAdded }: AddJobModalProps) => {
  const { createJob, loading: jobLoading } = useJobs();

  // State
  const [step, setStep] = useState<'input' | 'review' | 'form'>('input');
  const [jobText, setJobText] = useState('');
  const [parsedJob, setParsedJob] = useState<ParsedJob | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Sample job for user
  const SAMPLE_JOB = `Company: Google
Position: Senior Software Engineer
Location: Mountain View, CA
Salary Range: $200K - $250K
Experience Required: 5+ years
Seniority: Senior
Tech Stack: Python, Golang, Kubernetes
Description: We're looking for an experienced engineer to join our team...
Application Link: https://google.com/careers/job123`;

  // Smart job parser
  const parseJobPosting = (text: string): ParsedJob => {
    logInfo('Parsing job posting', { length: text.length });

    const parse = (pattern: RegExp, defaultVal = ''): string => {
      const match = text.match(pattern);
      return match ? match[1].trim() : defaultVal;
    };

    const title =
      parse(/(?:position|role|title):\s*([^\n]+)/i) ||
      parse(/^([^\n]+)/);

    const company = parse(/(?:company|employer):\s*([^\n]+)/i);
    const location = parse(/(?:location|city|area):\s*([^\n]+)/i);
    const salary = parse(/(?:salary|compensation|pay):\s*([^\n]+)/i);
    const experience = parse(/(?:experience|years?|requirements?):\s*([^\n]+)/i);
    
    let seniority = parse(/(?:seniority|level):\s*([^\n]+)/i);
    if (!seniority) {
      if (experience.toLowerCase().includes('5+') || experience.toLowerCase().includes('senior')) {
        seniority = 'Senior';
      } else if (experience.toLowerCase().includes('2-4') || experience.toLowerCase().includes('mid')) {
        seniority = 'Mid';
      } else {
        seniority = 'Junior';
      }
    }

    const techMatch = text.match(
      /(?:tech\s*stack|technologies?|stack|languages?):\s*([^\n]+(?:\n(?![A-Z])[^\n]+)*)/i
    );
    const techStr = techMatch ? techMatch[1] : '';
    const tech_stack = techStr
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 10);

    const description = text.substring(0, 500);
    const link = (text.match(/https?:\/\/[^\s]+/i) || [])[0] || '';

    return {
      title: title || 'Job Title',
      company: company || '',
      location: location || '',
      salary_range: salary || '',
      experience_required: experience || '',
      seniority_level: seniority,
      tech_stack,
      description,
      application_link: link,
    };
  };

  // Handle parse button
  const handleParse = () => {
    if (!jobText.trim()) {
      setError('Please paste a job posting');
      return;
    }

    try {
      const parsed = parseJobPosting(jobText);
      setParsedJob(parsed);
      setStep('review');
      setError('');
      logInfo('Job parsed successfully', { title: parsed.title });
    } catch (err) {
      setError('Failed to parse job posting. Try manual form instead.');
      logError('Job parsing failed', err);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!parsedJob) return;

    // Validation
    if (!parsedJob.title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!parsedJob.company.trim()) {
      setError('Company name is required');
      return;
    }

    try {
      setError('');
      const success = await createJob({
        title: parsedJob.title,
        company: parsedJob.company,
        location: parsedJob.location,
        salary_range: parsedJob.salary_range,
        experience_required: parsedJob.experience_required,
        seniority_level: parsedJob.seniority_level,
        tech_stack: parsedJob.tech_stack,
        description: parsedJob.description,
        application_link: parsedJob.application_link,
      });

      if (success) {
        logInfo('Job created successfully');
        onJobAdded();
      } else {
        setError('Failed to save job. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      logError('Job creation failed', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add New Job</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Input Step */}
          {step === 'input' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Paste a job posting or description. We'll automatically extract the details.
              </p>

              {/* Sample Job Button */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 mb-2">💡 Need a sample?</p>
                <button
                  onClick={() => {
                    setJobText(SAMPLE_JOB);
                    setCopied(false);
                  }}
                  className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Use sample job posting
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste job posting here..."
                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParse}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Parse & Review
                </button>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && parsedJob && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Review and adjust the extracted information:
              </p>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={parsedJob.title}
                    onChange={(e) =>
                      setParsedJob({ ...parsedJob, title: e.target.value })
                    }
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
                    value={parsedJob.company}
                    onChange={(e) =>
                      setParsedJob({ ...parsedJob, company: e.target.value })
                    }
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
                    value={parsedJob.location}
                    onChange={(e) =>
                      setParsedJob({ ...parsedJob, location: e.target.value })
                    }
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
                    value={parsedJob.salary_range}
                    onChange={(e) =>
                      setParsedJob({
                        ...parsedJob,
                        salary_range: e.target.value,
                      })
                    }
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
                    value={parsedJob.experience_required}
                    onChange={(e) =>
                      setParsedJob({
                        ...parsedJob,
                        experience_required: e.target.value,
                      })
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
                    value={parsedJob.seniority_level}
                    onChange={(e) =>
                      setParsedJob({
                        ...parsedJob,
                        seniority_level: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Junior</option>
                    <option>Mid</option>
                    <option>Senior</option>
                    <option>Lead</option>
                  </select>
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tech Stack
                </label>
                <div className="flex flex-wrap gap-2">
                  {parsedJob.tech_stack.map((tech, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {tech}
                      <button
                        onClick={() => {
                          const updated = parsedJob.tech_stack.filter(
                            (_, i) => i !== idx
                          );
                          setParsedJob({ ...parsedJob, tech_stack: updated });
                        }}
                        className="text-gray-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('input')}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={jobLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {jobLoading ? 'Saving...' : 'Save Job'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddJobModal;