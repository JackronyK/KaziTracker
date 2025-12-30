// src/components/Jobs/JobParserModal.tsx

/**
 * JobParserModal Component - FIXED VERSION
 * Properly converts ParsedJD to JobInput with all required fields
 */

import { useState } from 'react';
import { apiClient } from '../../api';
import { logInfo, logError } from '../../utils/errorLogger';
import type { ParsedJD, JobInput } from '../../types';

interface JobParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParsed: (jobData: JobInput) => void;
}

export const JobParserModal: React.FC<JobParserModalProps> = ({
  isOpen,
  onClose,
  onParsed,
}) => {
  const [jdText, setJdText] = useState('');
  const [jdUrl, setJdUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedJD | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!jdText.trim()) {
      setError('Please paste a job description');
      return;
    }

    setError(null);
    setParsing(true);
    setParsed(null);

    try {
      logInfo('Parsing job description with AI');
      
      const result = await apiClient.parseJD(jdText, jdUrl || undefined, true);
      
      setParsed(result);
      
      logInfo('Job description parsed successfully', {
        method: result.method,
        confidence: result.confidence,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse';
      setError(message);
      logError('Job description parsing failed', err as Error);
    } finally {
      setParsing(false);
    }
  };

  const handleUse = () => {
    if (!parsed) return;

    // ✅ CRITICAL FIX: Convert ParsedJD to JobInput with ALL required fields
    const jobData: JobInput = {
      title: parsed.title,
      company: parsed.company,
      location: parsed.location || '',
      salary_range: parsed.salary_range || '',
      description: parsed.description || '',  // ✅ Always include description
      apply_url: parsed.apply_url || jdUrl || '',
      experience_required: '',  // Default empty
      tech_stack: parsed.skills.join(', '),
      parsed_skills: parsed.skills.join(', '),
      seniority_level: parsed.seniority_level || 'mid',
      source: 'parsed',
    };

    logInfo('Passing parsed job data to form', jobData);
    
    // Pass to parent (JobsPage)
    onParsed(jobData);
    
    // Reset and close
    handleReset();
  };

  const handleReset = () => {
    setJdText('');
    setJdUrl('');
    setParsed(null);
    setError(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.85) return 'High Confidence';
    if (confidence >= 0.70) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🤖 AI Job Parser
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Paste a job description and let AI extract the details
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!parsed ? (
            // Input Form
            <div className="space-y-4">
              {/* URL (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job URL (Optional)
                </label>
                <input
                  type="url"
                  value={jdUrl}
                  onChange={(e) => setJdUrl(e.target.value)}
                  placeholder="https://company.com/careers/job-123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Job Description Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the full job description here...

Example:
Senior Software Engineer

TechCorp Inc. is hiring!
Location: Nairobi, Kenya
Salary: KSh 250,000 - 400,000

Requirements:
- 5+ years experience
- Python, React, AWS..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {jdText.length} characters
                  </p>
                  {jdText.length > 10000 && (
                    <p className="text-xs text-orange-600">
                      ⚠️ Text too long (max 10,000 chars)
                    </p>
                  )}
                </div>
              </div>

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

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>AI extracts: title, company, location, salary, skills, seniority</li>
                      <li>Falls back to rule-based if AI unavailable</li>
                      <li>Review and edit results before saving</li>
                      <li>Works best with complete job descriptions</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={parsing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleParse}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={parsing || !jdText.trim() || jdText.length > 10000}
                >
                  {parsing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Parsing with AI...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Parse with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Parsed Results
            <div className="space-y-6">
              {/* Confidence Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Parsed Results
                  </h3>
                  <p className="text-sm text-gray-600">
                    Review before saving - you can edit in the next step
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(
                      parsed.confidence
                    )}`}
                  >
                    {getConfidenceLabel(parsed.confidence)} ({(parsed.confidence * 100).toFixed(0)}%)
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {parsed.method === 'ai' ? '🤖 AI' : '📋 Rules'}
                  </span>
                </div>
              </div>

              {/* Parsed Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {parsed.title}
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {parsed.company}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {parsed.location || <span className="text-gray-400">Not found</span>}
                  </div>
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary Range
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {parsed.salary_range || <span className="text-gray-400">Not found</span>}
                  </div>
                </div>

                {/* Seniority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seniority Level
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg capitalize">
                    {parsed.seniority_level || <span className="text-gray-400">Not found</span>}
                  </div>
                </div>

                {/* Skills */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills Found ({parsed.skills.length})
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {parsed.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {parsed.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">No skills found</span>
                    )}
                  </div>
                </div>

                {/* Description Preview */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Preview)
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                    {parsed.description ? (
                      parsed.description.substring(0, 200) + (parsed.description.length > 200 ? '...' : '')
                    ) : (
                      <span className="text-gray-400">No description</span>
                    )}
                  </div>
                </div>

                {/* Apply URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application URL
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg break-all">
                    {parsed.apply_url ? (
                      <a
                        href={parsed.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        {parsed.apply_url}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not found</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Low Confidence Warning */}
              {parsed.confidence < 0.7 && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium">Low confidence extraction</p>
                      <p className="text-xs mt-1">
                        Please review the fields carefully in the next step. You can edit them before saving.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Parse Another
                </button>
                <button
                  type="button"
                  onClick={handleUse}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Use These Results</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobParserModal;