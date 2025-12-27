// src/pages/JobsPage.tsx

/**
 * JobsPage Component - Complete Version
 * Includes: AI Parser, Search, Filters, Edit, Delete, All Features
 */

import { useState, useEffect } from "react";
import { Plus, Briefcase, Sparkles } from 'lucide-react';
import { useJobs } from "../hooks/useJobs";
import type { Job, JobInput } from "../types/index";
import { logInfo } from "../utils/errorLogger";

// Components
import { JobList } from '../components/Jobs/JobList';
import { JobFilters } from '../components/Jobs/JobFilters';
import { AddJobModal } from '../components/Jobs/AddJobModal';
import { EditJobModal } from '../components/Jobs/EditJobModal';
import { JobParserModal } from '../components/Jobs/JobParserModal';

/**
 * JobsPage Component
 * 
 * Features:
 * - AI-powered job parsing
 * - Display all jobs
 * - Search & filter
 * - Add new job (manual or parsed)
 * - Edit existing job
 * - Delete job
 * - Loading & error states
 */

export const JobsPage = () => {
  // Hooks
  const { jobs, loading, error, fetchJobs, deleteJob } = useJobs();

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [seniority, setSeniority] = useState<string>('all');
  
  // Modal states
  const [showParserModal, setShowParserModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  // Prefilled data from AI parser
  const [prefilledJob, setPrefilledJob] = useState<JobInput | null>(null);
  
  // Local error state
  const [localError, setLocalError] = useState('');

  // Fetch jobs on mount
  useEffect(() => {
    logInfo('JobsPage mounted - fetching jobs');
    fetchJobs();
  }, [fetchJobs]);

  // Filter jobs based on search and seniority
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeniority =
      seniority === 'all' || job.seniority_level === seniority;

    return matchesSearch && matchesSeniority;
  });



  // =========================================================================
  // HANDLERS
  // =========================================================================

  /**
   * Handle parsed job data from AI parser
   */
  const handleJobParsed = (jobData: JobInput) => {
    logInfo('Job parsed successfully with AI', jobData);
    
    // Store parsed data
    setPrefilledJob(jobData);
    
    // Close parser modal
    setShowParserModal(false);
    
    // Open add job modal with prefilled data
    setShowAddModal(true);
  };

  /**
   * Handle manual job creation (no AI parsing)
   */
  const handleManualAdd = () => {
    logInfo('Opening manual add job form');
    setPrefilledJob(null);
    setShowAddModal(true);
  };

  /**
   * Handle delete job
   */
  const handleDeleteJob = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    logInfo('Deleting job', { jobId: id });
    const success = await deleteJob(id);

    if (success) {
      setLocalError('');
      logInfo('Job deleted successfully');
    } else {
      setLocalError('Failed to delete job. Please try again.');
    }
  };

  /**
   * Handle modal close
   */
  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowParserModal(false);
    setEditingJob(null);
    setPrefilledJob(null);
    setLocalError('');
  };

  /**
   * Handle successful job addition
   */
  const handleJobAdded = () => {
    fetchJobs();
    handleCloseModals();
  };

  /**
   * Handle successful job update
   */
  const handleJobUpdated = () => {
    fetchJobs();
    handleCloseModals();
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 mt-1">
              Manage all your job positions ({filteredJobs.length} found)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* AI Parser Button (Primary) */}
            <button
              onClick={() => {
                logInfo('AI Parser button clicked');
                setShowParserModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              <span className="hidden sm:inline">Parse with AI</span>
              <span className="sm:hidden">AI Parse</span>
            </button>

            {/* Manual Add Button */}
            <button
              onClick={() => {
                logInfo('Manual add button clicked');
                handleManualAdd();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Manually</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {(error || localError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ {error || localError}
            </p>
            <button
              onClick={() => setLocalError('')}
              className="text-red-600 hover:text-red-700 text-xs mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* AI Parser Info Banner */}
        {!showParserModal && jobs.length === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ✨ Try AI-Powered Job Parsing!
                </h3>
                <p className="text-gray-700 mb-3">
                  Simply paste any job description and let AI extract all the details automatically - 
                  title, company, location, salary, skills, and more!
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-gray-700">
                    ⚡ Instant extraction
                  </span>
                  <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-gray-700">
                    🎯 85-95% accuracy
                  </span>
                  <span className="px-3 py-1 bg-white bg-opacity-60 rounded-full text-gray-700">
                    🔄 Auto-fallback to rules
                  </span>
                </div>
                <button
                  onClick={() => setShowParserModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Try AI Parser Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <JobFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          seniority={seniority}
          onSeniorityChange={setSeniority}
        />

        {/* Jobs List or Empty State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              {jobs.length === 0 ? 'No jobs yet' : 'No jobs match your filters'}
            </p>
            <p className="text-gray-500 mt-2">
              {jobs.length === 0
                ? 'Start by parsing a job with AI or adding one manually'
                : 'Try adjusting your search or filters'}
            </p>
            {jobs.length === 0 && (
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => setShowParserModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  Parse with AI
                </button>
                <button
                  onClick={handleManualAdd}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Manually
                </button>
              </div>
            )}
          </div>
        ) : (
          <JobList
            jobs={filteredJobs}
            onEdit={setEditingJob}
            onDelete={handleDeleteJob}
          />
        )}
      </div>

      {/* Modals */}
      
      {/* AI Parser Modal */}
      <JobParserModal
        isOpen={showParserModal}
        onClose={handleCloseModals}
        onParsed={handleJobParsed}
      />

      {/* Add Job Modal */}
      {showAddModal && (
        <AddJobModal
          onClose={handleCloseModals}
          onJobAdded={handleJobAdded}
          initialData={prefilledJob}
        />
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={handleCloseModals}
          onJobUpdated={handleJobUpdated}
        />
      )}
    </div>
  );
};

export default JobsPage;