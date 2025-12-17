// src/pages/JobsPage.tsx
/**
 * JobsPage Component
 * Main page for job management
 */
import { useState, useEffect } from "react";
import {Plus, Briefcase} from 'lucide-react';
import { useJobs } from "../hooks/useJobs";
import type { Job } from "../types/index";
import { logInfo } from "../utils/errorLogger";

// Componets
import { JobList } from '../components/Jobs/JobList';
import { JobFilters } from '../components/Jobs/JobFilters';
import { AddJobModal } from '../components/Jobs/AddJobModal';
import { EditJobModal } from '../components/Jobs/EditJobModal';

/**
 * JobsPage Component
 * 
 * Features:
 * - Display all jobs
 * - Search & filter
 * - Add new job
 * - Edit existing job
 * - Delete job
 * - Loading & error states
 */

export const JobsPage = () => {
  // Hooks
  const { jobs, loading, error, fetchJobs, deleteJob } = useJobs();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [seniority, setSeniority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
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

  // Handle delete
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

  // Handle modal close
  const handleCloseModals = () => {
    setShowAddModal(false);
    setEditingJob(null);
    setLocalError('');
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

          <button
            onClick={() => {
              logInfo('Add job button clicked');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Job
          </button>
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
              {jobs.length === 0 ? 'No jobs yet' : 'No jobs match your filter'}
            </p>
            <p className="text-gray-500 mt-2">
              {jobs.length === 0
                ? 'Start by adding a job to track'
                : 'Try adjusting your search or filters'}
            </p>
            {jobs.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Your First Job
              </button>
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
      {showAddModal && (
        <AddJobModal
          onClose={handleCloseModals}
          onJobAdded={() => {
            fetchJobs();
            handleCloseModals();
          }}
        />
      )}

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={handleCloseModals}
          onJobUpdated={() => {
            fetchJobs();
            handleCloseModals();
          }}
        />
      )}
    </div>
  );
};

export default JobsPage;