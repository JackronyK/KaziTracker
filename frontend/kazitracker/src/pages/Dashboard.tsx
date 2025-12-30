// src/pages/Dashboard.tsx

/**
 * DashboardPage Component
 * Main dashboard with analytics and insights
 */

import { useState, useEffect } from 'react';
import { useApplications } from '../hooks/useApplications';
import { useJobs } from '../hooks/useJobs';
import { useResumes } from '../hooks/useResumes';
import { useUser } from '../hooks/useUser';
import { logInfo, logError } from '../utils/errorLogger';

import { AnalyticsCards } from '../components/Dashboard/AnalyticsCards';
import { StatusBreakdown } from '../components/Dashboard/StatusBreakDown';
import { ApplicationTimeline } from '../components/Dashboard/ApplicationTimeline';
import { InsightPanel } from '../components/Dashboard/InsightPanel';
import { StatsChart } from '../components/Dashboard/StatsChart';
import { GoalTracker } from '../components/Dashboard/GoalTracker';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { RejectionAnalysis}  from '../components/Dashboard/RejectionAnalysis';
import type { NavTab } from '../components/Layout/Sidebar';

import { AddJobModal } from '../components/Jobs/AddJobModal';
import { CreateApplicationModal } from '../components/applications/CreateApplicationModal';
import { UploadResumeModal } from '../components/Resume/uploadResumeModal';
interface DashboardPageProps {
  activeTab?: NavTab;
  onNavigate?: (tab: NavTab) => void;
}

/**
 * DashboardPage Component
 * 
 * Props:
 * - activeTab: Current active tab (optional)
 * - onNavigate: Navigation callback (optional - uses hook if not provided)
 * 
 * Features:
 * - Real-time analytics
 * - Multiple visualizations
 * - Smart insights
 * - Goal tracking
 * - Personalized welcome with user name
 * - Quick actions with proper navigation
 * - Responsive layout
 * - Production-ready error handling
 */

export const DashboardPage = ({ 
  activeTab = 'dashboard',
  onNavigate 
}: DashboardPageProps) => {
  // Hooks
  const { applications, loading: appLoading, error: appError, fetchApplications } = useApplications();
  const { jobs, loading: jobsLoading, fetchJobs } = useJobs();
  const { resumes, loading: resumesLoading, fetchResumes } = useResumes();
  const { user, loading: userLoading } = useUser();

  // Modal states
  const [showAddJobModal, setShowAddJobModal] = useState(false);
 // const [showParserModal, setShowParserModal] = useState(false);
  const [showCreateAppModal, setShowCreateAppModal] = useState(false);
  const [showUploadResumeModal, setShowUploadResumeModal] = useState(false);

  // State for 30-day chart
  const [chartData, setChartData] = useState<
    Array<{
      date: string;
      applied: number;
      interviews: number;
      offers: number;
    }>
  >([]);

  // State for data refresh
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch data on mount
  useEffect(() => {
    logInfo('Dashboard mounted - fetching data');
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchApplications(),
          fetchJobs(),
          fetchResumes()
        ]);
        setLastRefresh(new Date());
        logInfo('Dashboard data fetched successfully');
      } catch (error) {
        logError('Failed to fetch dashboard data', error as Error);
      }
    };

    fetchAllData();
  }, [fetchApplications, fetchJobs, fetchResumes]);

  // Generate 30-day chart data
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const today = new Date();

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const dateStr = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        const dayApps = applications.filter((app) => {
          const appDate = new Date(app.created_at);
          return appDate.toDateString() === date.toDateString();
        });

        data.push({
          date: dateStr,
          applied: dayApps.filter((a) => a.status !== 'saved').length,
          interviews: dayApps.filter((a) => a.status === 'interview').length,
          offers: dayApps.filter((a) => a.status === 'offer').length,
        });
      }

      setChartData(data);
    };

    if (applications.length > 0) {
      generateChartData();
    }
  }, [applications]);

  // Calculate stats
  const stats = {
    total: applications.length,
    saved: applications.filter((a) => a.status === 'saved').length,
    applied: applications.filter((a) => a.status === 'applied').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    offer: applications.filter((a) => a.status === 'offer').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  // Calculate rates
  const interviewRate =
    stats.applied > 0 ? (stats.interview / stats.applied) * 100 : 0;
  const successRate =
    stats.total > 0 ? (stats.offer / stats.total) * 100 : 0;

  // Hot streak calculation
  const hotStreak = (() => {
    let streak = 0;
    const recentApps = [...applications]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10);

    for (const app of recentApps) {
      if (['interview', 'offer'].includes(app.status)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  })();

  // =========================================================================
  // QUICK ACTIONS HANDLERS - Now trigger specific actions, not just navigation
  // =========================================================================

  /**
   * Handle Add Job - Opens modal to add a new job
   */
  const handleAddJob = () => {
    logInfo('Quick action: Opening Add Job modal');
    setShowAddJobModal(true);
  };

  /**
   * Handle Create Application - Opens modal to create application
   */
  const handleCreateApplication = () => {
    logInfo('Quick action: Opening Create Application modal');
    setShowCreateAppModal(true);
  };

  /**
   * Handle Upload Resume - Opens file picker or modal
   */
  const handleUploadResume = () => {
    logInfo('Quick action: Opening Upload Resume modal');
    setShowUploadResumeModal(true);
  };

  /**
   * Handle View Calendar - Navigate to Premium Hub calendar
   */
  const handleViewCalendar = () => {
    logInfo('Quick action: Navigating to Calendar');
    if (onNavigate) {
      onNavigate('premium');
    }
  };

  // Get personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get user's first name or fallback
  const getUserName = () => {
    if (user?.full_name) {
      return user.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  // Loading state for initial data fetch
  const isInitialLoading = appLoading && applications.length === 0;
  const isLoading = appLoading || jobsLoading || resumesLoading || userLoading;

  // Error state
  if (appError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-500 text-center mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {appError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page Header with Personalized Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {getUserName()}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {isInitialLoading 
              ? 'Loading your job search progress...' 
              : "Here's your job search progress."}
          </p>
        </div>

        {/* Quick Actions - Now trigger modals/actions */}
        <QuickActions
          onAddJob={handleAddJob}
          onCreateApplication={handleCreateApplication}
          onUploadResume={handleUploadResume}
          onViewCalendar={handleViewCalendar}
        />

        {/* Analytics Cards */}
        <div className="mt-8">
          <AnalyticsCards
            totalApps={stats.total}
            appliedCount={stats.applied}
            interviewCount={stats.interview}
            offerCount={stats.offer}
            rejectedCount={stats.rejected}
            interviewRate={interviewRate}
            successRate={successRate}
            hotStreak={hotStreak}
          />
        </div>

        {/* Charts and Insights */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <StatusBreakdown
            saved={stats.saved}
            applied={stats.applied}
            interview={stats.interview}
            offer={stats.offer}
            rejected={stats.rejected}
          />

          <InsightPanel
            totalApps={stats.total}
            appliedCount={stats.applied}
            interviewCount={stats.interview}
            offerCount={stats.offer}
            rejectedCount={stats.rejected}
            interviewRate={interviewRate}
            successRate={successRate}
          />
        </div>

        {/* 30-Day Chart */}
        <div className="mt-8">
          <StatsChart data={chartData} />
        </div>

        {/* Goal Tracker and Rejection Analysis */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GoalTracker
            appliedCount={stats.applied}
            interviewCount={stats.interview}
            offerCount={stats.offer}
          />

          <RejectionAnalysis applications={applications} />
        </div>

        {/* Recent Activity Timeline */}
        <div className="mt-8">
          <ApplicationTimeline applications={applications} limit={10} />
        </div>

        {/* Stats Summary */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-2">
                🎯 You're making progress, {getUserName()}!
              </h3>
              <p className="text-blue-100">
                You've been active in your job search. Keep up the momentum with
                consistent applications and follow-ups.
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Jobs Saved:</span>
                <span className="font-bold">{jobs.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Applications:</span>
                <span className="font-bold">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Resumes:</span>
                <span className="font-bold">{resumes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-bold">{successRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-blue-200 text-xs pt-2 border-t border-blue-400">
                <span>Last updated:</span>
                <span>{lastRefresh.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && !isInitialLoading && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3 z-50">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-700">Updating data...</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddJobModal && (
        <AddJobModal
          isOpen={showAddJobModal}
          onClose={() => setShowAddJobModal(false)}
          onSuccess={() => {
            setShowAddJobModal(false);
            fetchJobs(); // Refresh jobs list
          }}
        />
      )}

      {showCreateAppModal && (
        <CreateApplicationModal
          isOpen={showCreateAppModal}
          onClose={() => setShowCreateAppModal(false)}
          jobs={jobs}
          resumes={resumes}
          onSuccess={() => {
            setShowCreateAppModal(false);
            fetchApplications(); // Refresh applications
          }}
        />
      )}

      {showUploadResumeModal && (
        <UploadResumeModal
          isOpen={showUploadResumeModal}
          onClose={() => setShowUploadResumeModal(false)}
          onSuccess={() => {
            setShowUploadResumeModal(false);
            fetchResumes(); // Refresh resumes
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;