// src/pages/ApplicationsPage.tsx

/**
 * ApplicationsPage Component
 * Main page for application tracking
 */

import { useState, useEffect } from 'react';
import { Plus, FileCheck } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';
import { useJobs } from '../hooks/useJobs';
import type { Application } from '../types/index';
import { logInfo } from '../utils/errorLogger';

import { ApplicationList } from '../components/applications/ApplicationList';
import { ApplicationFilters } from '../components/applications/ApplicationFilters';
import { CreateApplicationModal } from '../components/applications/CreateApplicationModal';
import { UpdateStatusModal } from '../components/applications/UpdateStatusModal';

/**
 * ApplicationsPage Component
 * 
 * Features:
 * - Display all applications
 * - Track application lifecycle
 * - Update status with dates
 * - Search & filter by status
 * - Sort applications
 * - Delete applications
 * - Loading & error states
 */

export const ApplicationsPage = () => {
  // Hooks
  const { applications, loading, error, fetchApplications, deleteApplication } =
    useApplications();
  const { jobs } = useJobs();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [localError, setLocalError] = useState('');

  // Fetch applications on mount
  useEffect(() => {
    logInfo('ApplicationsPage mounted - fetching applications');
    fetchApplications();
  }, [fetchApplications]);

  // Filter and sort applications
  const filteredApps = applications
    .filter((app) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        (app.company_name?.toLowerCase() || '').includes(
          searchQuery.toLowerCase()
        ) ||
        (app.job_title?.toLowerCase() || '').includes(
          searchQuery.toLowerCase()
        );

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
          const statusOrder = ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];
          return (
            statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
          );
        default:
          return 0;
      }
    });

  // Handle delete
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

  // Handle modal close
  const handleCloseModals = () => {
    setShowCreateModal(false);
    setEditingApp(null);
    setLocalError('');
  };

  // Get stats
  const stats = {
    total: applications.length,
    saved: applications.filter((a) => a.status === 'Saved').length,
    applied: applications.filter((a) => a.status === 'Applied').length,
    interview: applications.filter((a) => a.status === 'Interview').length,
    offer: applications.filter((a) => a.status === 'Offer').length,
    rejected: applications.filter((a) => a.status === 'Rejected').length,
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600 mt-1">
              Track {applications.length} application{applications.length !== 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={() => {
              logInfo('Create application button clicked');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Application
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium">📌 Saved</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.saved}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium">📤 Applied</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{stats.applied}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium">🎯 Interview</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">{stats.interview}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium">🎉 Offer</p>
            <p className="text-2xl font-bold text-green-900 mt-1">{stats.offer}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium">❌ Rejected</p>
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
              className="text-red-600 hover:text-red-700 text-xs mt-2"
            >
              Dismiss
            </button>
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
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
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
                onClick={() => setShowCreateModal(true)}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
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
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateApplicationModal
          onClose={handleCloseModals}
          onApplicationCreated={() => {
            fetchApplications();
            handleCloseModals();
          }}
        />
      )}

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