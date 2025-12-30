// src/pages/ApplicationsPage.tsx

/**
 * ApplicationsPage Component - UPDATED
 * Main page for application tracking with resume performance tracking
 */

import { useState, useEffect } from 'react';
import { Plus, FileCheck } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';
import { useJobs } from '../hooks/useJobs';
import { useResumes } from '../hooks/useResumes';
import type { Application } from '../types/index';
import { logInfo } from '../utils/errorLogger';

// Components
import { ApplicationList } from '../components/applications/ApplicationList';
import { ApplicationFilters } from '../components/applications/ApplicationFilters';
import { CreateApplicationModal } from '../components/applications/CreateApplicationModal';
import { UpdateStatusModal } from '../components/applications/UpdateStatusModal';
import { ResumePerformance } from '../components/Premium/ResumePerformance';

/**
 * ApplicationsPage Component
 * 
 * Features:
 * ✅ Display all applications with resume tracking
 * ✅ Create applications (resume selection REQUIRED)
 * ✅ Track application lifecycle with resume info
 * ✅ Update status with dates
 * ✅ Search & filter by status
 * ✅ Resume performance dashboard
 * ✅ CV Journey visualization
 * ✅ Loading & error states
 * ✅ Production-ready
 */
export const ApplicationsPage = () => {
  // =========================================================================
  // HOOKS
  // =========================================================================

  const { applications, loading: appsLoading, error, fetchApplications, deleteApplication } = useApplications();
  const { jobs, loading: jobsLoading, fetchJobs } = useJobs();
  const { resumes, loading: resumesLoading, fetchResumes } = useResumes();

  // =========================================================================
  // STATE
  // =========================================================================

  const [canShowCreateModal, setCanShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [localError, setLocalError] = useState('');

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  // Fetch all data on mount
  useEffect(() => {
    logInfo('ApplicationsPage mounted - fetching applications, jobs, and resumes');
    
    // Fetch all data in parallel
    Promise.all([
      fetchApplications(),
      fetchJobs(),
      fetchResumes(),
    ]).then(() => {
      setCanShowCreateModal(true);
      logInfo('All data loaded successfully');
    }).catch((err) => {
      logInfo('Error loading initial data', { error: err });
    });
  }, [fetchApplications, fetchJobs, fetchResumes]);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  // Filter and sort applications
  const filteredApps = applications
    .filter((app) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        (app.job?.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (app.job?.company?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === 'All Statuses' || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return (
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
          );
        case 'date-desc':
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
        case 'status':
          const statusOrder = ['saved', 'applied', 'interview', 'offer', 'rejected'];
          return (
            statusOrder.indexOf(a.status.toLowerCase()) -
            statusOrder.indexOf(b.status.toLowerCase())
          );
        default:
          return 0;
      }
    });

  // Get statistics
  const stats = {
    total: applications.length,
    saved: applications.filter((a) => a.status.toLowerCase() === 'saved').length,
    applied: applications.filter((a) => a.status.toLowerCase() === 'applied').length,
    interview: applications.filter((a) => a.status.toLowerCase() === 'interview').length,
    offer: applications.filter((a) => a.status.toLowerCase() === 'offer').length,
    rejected: applications.filter((a) => a.status.toLowerCase() === 'rejected').length,
  };

  // =========================================================================
  // HANDLERS
  // =========================================================================

  /**
   * Handle delete application
   */
  const handleDeleteApp = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    logInfo('Deleting application', { appId: id });
    const success = await deleteApplication(id);

    if (success) {
      setLocalError('');
      logInfo('Application deleted successfully');
    } else {
      setLocalError('Failed to delete application. Please try again.');
    }
  };

  /**
   * Handle modal close
   */
  const handleCloseModals = () => {
    setShowCreateModal(false);
    setEditingApp(null);
    setLocalError('');
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  const isLoading = appsLoading || jobsLoading || resumesLoading;

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600 mt-1">
              Track {applications.length} application{applications.length !== 1 ? 's' : ''} • 
              {' '} {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={() => {
              logInfo('Create application button clicked');
              if (canShowCreateModal && resumes.length > 0) {
                setShowCreateModal(true);
              }
            }}
            disabled={!canShowCreateModal || resumes.length === 0 || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            New Application
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">📌 Saved</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.saved}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">📤 Applied</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.applied}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">🎯 Interview</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">{stats.interview}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">🎉 Offer</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{stats.offer}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">❌ Rejected</p>
            <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
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
              className="text-red-600 hover:text-red-700 text-xs mt-2 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Resume Warning */}
        {resumes.length === 0 && !isLoading && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700 font-medium">
              ⚠️ No resumes uploaded yet. Upload a resume to track application performance.
            </p>
          </div>
        )}

        {/* Filters */}
        <ApplicationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Applications List or Empty State */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200 mb-8">
            <FileCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              {applications.length === 0
                ? 'No applications yet'
                : 'No applications match your filter'}
            </p>
            <p className="text-gray-500 mt-2">
              {applications.length === 0
                ? 'Start tracking your job applications'
                : 'Try adjusting your search or filters'}
            </p>
            {applications.length === 0 && (
              <button
                onClick={() => {
                  if (resumes.length > 0) {
                    setShowCreateModal(true);
                  }
                }}
                disabled={resumes.length === 0}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Create Your First Application
              </button>
            )}
          </div>
        ) : (
          <ApplicationList
            applications={filteredApps}
            onStatusChange={setEditingApp}
            onDelete={handleDeleteApp}
          />
        )}

        {/* Resume Performance Section */}
        {resumes.length > 0 && applications.length > 0 && (
          <div className="mt-12 pt-12 border-t-2 border-gray-200">
            <ResumePerformance
              resumes={resumes}
              applications={applications}
              loading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Modals */}

      {/* Create Application Modal */}
      {showCreateModal && (
        <CreateApplicationModal
          jobs={jobs}
          resumes={resumes}
          onClose={handleCloseModals}
          onApplicationCreated={() => {
            fetchApplications();
            handleCloseModals();
          }}
        />
      )}

      {/* Update Status Modal */}
      {editingApp && (
        <UpdateStatusModal
          application={editingApp}
          onClose={handleCloseModals}
          onStatusUpdated={() => {
            fetchApplications();
            handleCloseModals();
          }}
        />
      )}
    </div>
  );
};

export default ApplicationsPage;