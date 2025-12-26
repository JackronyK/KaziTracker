// src/pages/Dashboard.tsx

/**
 * DashboardPage Component
 * Main dashboard with analytics and insights
 */

import { useState, useEffect } from 'react';
import { useApplications } from '../hooks/useApplications';
import { useJobs } from '../hooks/useJobs';
import { useResumes } from '../hooks/useResumes';
import { logInfo } from '../utils/errorLogger';

import { AnalyticsCards } from '../components/Dashboard/AnalyticsCards';
import { StatusBreakdown } from '../components/Dashboard/StatusBreakDown';
import { ApplicationTimeline } from '../components/Dashboard/ApplicationTimeline';
import { InsightPanel } from '../components/Dashboard/InsightPanel';
import { StatsChart } from '../components/Dashboard/StatsChart';
import { GoalTracker } from '../components/Dashboard/GoalTracker';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { RejectionAnalysis}  from '../components/Dashboard/RejectionAnalysis';
import type { NavTab } from '../components/Layout/Sidebar';

interface DashboardPageProps {
  activeTab?: NavTab;
}

/**
 * DashboardPage Component
 * 
 * Props:
 * - activeTab: Current active tab (for navigation)
 * 
 * Features:
 * - Real-time analytics
 * - Multiple visualizations
 * - Smart insights
 * - Goal tracking
 * - Quick actions
 * - Responsive layout
 */
export const DashboardPage = ({ activeTab = 'dashboard' }: DashboardPageProps) => {
  // Hooks
  const { applications, loading: appLoading, fetchApplications } = useApplications();
  const { jobs, fetchJobs } = useJobs();
  const { resumes, fetchResumes } = useResumes();

  // State for 30-day chart
  const [chartData, setChartData] = useState<
    Array<{
      date: string;
      applied: number;
      interviews: number;
      offers: number;
    }>
  >([]);

  // Fetch data on mount
  useEffect(() => {
    logInfo('Dashboard mounted - fetching data');
    fetchApplications();
    fetchJobs();
    fetchResumes();    
  }, [fetchApplications, fetchJobs, fetchResumes]);

  // Generate 30-day chart data

  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const today = new Date();

      for (let i = 29; i>= 0 ; i--){
        const date = new Date(today);
        date.setDate(date.getDate() -i);

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
          applied: dayApps.filter((a) => a.status !== 'Saved').length,
          interviews: dayApps.filter((a) => a.status === 'Interview').length,
          offers: dayApps.filter((a) => a.status === 'Offer').length,
        });
      }

      setChartData(data);
    };

    generateChartData();
  }, [applications]);

  // Calculate stats
  const stats = {
    total: applications.length,
    saved: applications.filter((a) => a.status === 'Saved').length,
    applied: applications.filter((a) => a.status === 'Applied').length,
    interview: applications.filter((a) => a.status === 'Interview').length,
    offer: applications.filter((a) => a.status === 'Offer').length,
    rejected: applications.filter((a) => a.status === 'Rejected').length,
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
      if (['Interview', 'Offer'].includes(app.status)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  })();

  // Handle quick actions
  const handleAddJob = () => {
    logInfo('Quick action: Add Job');
    // Navigate to Jobs tab
    window.dispatchEvent(
      new CustomEvent('navigate', { detail: { tab: 'jobs' } })
    );
  };

  const handleCreateApplication = () => {
    logInfo('Quick action: Create Application');
    // Navigate to Applications tab
    window.dispatchEvent(
      new CustomEvent('navigate', { detail: { tab: 'applications' } })
    );
  };

  const handleUploadResume = () => {
    logInfo('Quick action: Upload Resume');
    // Navigate to Resumes tab
    window.dispatchEvent(
      new CustomEvent('navigate', { detail: { tab: 'resumes' } })
    );
  };

  const handleViewCalendar = () => {
    logInfo('Quick action: View Calendar');
    // In Phase 7, this would navigate to calendar
  }; 
  
  
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className='p-4 sm:p-6 lg:p-8'>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your job search progress.</p>
        </div>

        {/* Quick Actions */}
        <QuickActions
          onAddJob={handleAddJob}
          onCreateApplication={handleCreateApplication}
          onUploadResume={handleUploadResume}
          onViewCalendar={handleViewCalendar}        
        />

        {/* Analytics Cards */}
        <div className='mt-8'>
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
        <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Status Breakdown */}
          <StatusBreakdown
            saved={stats.saved}
            applied={stats.applied}
            interview={stats.interview}
            offer={stats.offer}
            rejected={stats.rejected}
          />

          { /* Insights*/ }
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
        <div className='mt-8'>
          <StatsChart data={chartData}/>
        </div>

        {/* Goal Tracker and Timeline */}
        <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Goal Tracker */}
          <GoalTracker
            appliedCount={stats.applied}
            interviewCount={stats.interview}
            offerCount={stats.offer}            
          />
          {/* PHASE 7: Rejection Analysis */}
          <div className="mt-8">
            <RejectionAnalysis applications={applications} />
          </div>  

          {/* Recent Activity */}
          <ApplicationTimeline applications={applications} limit={10}/>
        </div>

        {/* Stats Summary */}
        <div className='mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-8 text-white'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-lg font-bold mb-2'>You are making progress!</h3>
              <p className='text-blue-100'>
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
            </div>
          </div>
        </div>

        {/* Loading State */}
        {appLoading && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-700">Updating data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;