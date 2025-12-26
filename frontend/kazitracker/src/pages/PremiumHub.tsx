// src/pages/PFeuturesHub.tsx

/**
 * Phase 7 Hub Page
 * Unified dashboard for Interview Scheduler, Offer Tracker, Deadline Tracker, Resume Performance
 */
import { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  AlertCircle,
  TrendingUp,
  ArrowLeft,
  Settings,
} from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
import { logInfo } from '../utils/errorLogger';

// components
import { InterviewScheduler } from '../components/applications/InterviewScheduler';
import { OfferTracker } from '../components/applications/OfferTracker';
import { DeadlineTracker } from '../components/applications/DeadlineTracker';
import { ResumePerformance } from '../components/applications/ResumePerformance';

// hooks
import { useInterviews } from '../hooks/useInterviews';
import { useOffers } from '../hooks/useOffers';
import { useDeadlines } from '../hooks/useDeadlines';
import { useResumes } from '../hooks/useResumes';

type PremiumHubTab = 'interviews' | 'offers' | 'deadlines' | 'resume';

interface TabConfig {
  id: PremiumHubTab;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  badge?: number;
  description: string;
}

interface PremiumHubProps {
  onNavigateToDashboard?: () => void;  // Callback for back button
}

/**
 * Premium Hub Page
 *
 * Features:
 * - Tabbed interface for all Phase 7 components
 * - Real-time data from hooks
 * - Quick stats overview with live badges
 * - Navigation back to dashboard
 * - Responsive design
 * - Error handling and loading states
 */
export const PremiumHub = ({ onNavigateToDashboard }: PremiumHubProps) => {
  const [activeTab, setActiveTab] = useState<PremiumHubTab>('interviews');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // =========================================================================
  // HOOKS - Real Data Integration
  // =========================================================================

  const { interviews, loading: interviewLoading, fetchInterviews, error: interviewError } = useInterviews();
  const { offers, loading: offersLoading, fetchOffers, error: offersError } = useOffers();
  const { deadlines, loading: deadlinesLoading, fetchDeadlines, error: deadlinesError, getUrgentDeadlines } = useDeadlines();
  const {
    loading: resumesLoading,
    fetchResumes,
    error: resumesError,
  } = useResumes();

  // =========================================================================
  // FETCH DATA ON MOUNT
  // =========================================================================

  useEffect(() => {
    logInfo('Premium Hub mounted - fetching all data');
    fetchInterviews();
    fetchOffers();
    fetchDeadlines();
    fetchResumes();
  }, [fetchInterviews, fetchOffers, fetchDeadlines, fetchResumes]);

  // =========================================================================
  // COMPUTE STATS
  // =========================================================================

  const urgentDeadlines = getUrgentDeadlines();
  const pendingOffers = offers.filter((o) => o.status === 'pending').length;
  const upcomingInterviews = interviews.filter((i) => {
    const interviewDate = new Date(i.date);
    const today = new Date();
    return interviewDate >= today;
  }).length;

  const stats = {
    interviews: upcomingInterviews,
    offers: pendingOffers,
    deadlines: deadlines.length,
    urgentDeadlines: urgentDeadlines.length,
  };

  // =========================================================================
  // TAB CONFIGURATION
  // =========================================================================

  const tabs: TabConfig[] = [
    {
      id: 'interviews',
      label: 'Interviews',
      icon: <Calendar className="w-5 h-5" />,
      component: <InterviewScheduler />,
      badge: stats.interviews > 0 ? stats.interviews : undefined,
      description: 'Schedule and prepare for interviews',
    },
    {
      id: 'offers',
      label: 'Offers',
      icon: <DollarSign className="w-5 h-5" />,
      component: <OfferTracker />,
      badge: stats.offers > 0 ? stats.offers : undefined,
      description: 'Track and negotiate job offers',
    },
    {
      id: 'deadlines',
      label: 'Deadlines',
      icon: <AlertCircle className="w-5 h-5" />,
      component: <DeadlineTracker />,
      badge: stats.urgentDeadlines > 0 ? stats.urgentDeadlines : undefined,
      description: 'Stay on top of all deadlines',
    },
    {
      id: 'resume',
      label: 'Resume Performance',
      icon: <TrendingUp className="w-5 h-5" />,
      component: <ResumePerformance />,
      description: 'Analyze resume success rates',
    },
  ];

  const activeTabConfig = tabs.find((t) => t.id === activeTab)!;

  // =========================================================================
  // HANDLE ERRORS
  // =========================================================================

  const tabError =
    activeTab === 'interviews'
      ? interviewError
      : activeTab === 'offers'
      ? offersError
      : activeTab === 'deadlines'
      ? deadlinesError
      : activeTab === 'resume'
      ? resumesError
      : null;

  const tabLoading =
    activeTab === 'interviews'
      ? interviewLoading
      : activeTab === 'offers'
      ? offersLoading
      : activeTab === 'deadlines'
      ? deadlinesLoading
      : activeTab === 'resume'
      ? resumesLoading
      : false;

  // =========================================================================
  // HANDLE BACK BUTTON
  // =========================================================================

  const handleBackToDashboard = () => {
    logInfo('Premium Hub: Navigating back to dashboard');
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    }
    // Alternative: Emit custom event if callback not provided
    else {
      window.dispatchEvent(
        new CustomEvent('navigate', { detail: { tab: 'dashboard' } })
      );
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="flex h-full">
        {/* Sidebar Navigation */}
        <div
          className={`transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-white border-r border-gray-200 flex flex-col`}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <h1 className="text-lg font-bold text-gray-900">Premium Hub</h1>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title={sidebarOpen ? 'Collapse' : 'Expand'}
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex-1 space-y-2 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={sidebarOpen ? '' : tab.label}
              >
                {tab.icon}
                {sidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{tab.label}</p>
                    <p className="text-xs text-gray-500">{tab.description}</p>
                  </div>
                )}
                {sidebarOpen && tab.badge && tab.badge > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Footer Navigation */}
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={handleBackToDashboard}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              title={sidebarOpen ? '' : 'Back to Dashboard'}
            >
              <ArrowLeft className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium text-sm">Back to Dashboard</span>}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                {activeTabConfig.icon}
                <h1 className="text-3xl font-bold text-gray-900">
                  {activeTabConfig.label}
                </h1>
              </div>
              <p className="text-gray-600">{activeTabConfig.description}</p>
            </div>

            {/* Quick Stats - Real Data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    activeTab === tab.id
                      ? 'bg-blue-100 border-2 border-blue-600'
                      : 'bg-white border border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm font-medium">
                      {tab.label}
                    </span>
                    {tab.badge && tab.badge > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Error State */}
            {tabError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-700">
                  ⚠️ Error loading {activeTabConfig.label.toLowerCase()}
                </p>
                <p className="text-xs text-red-600 mt-1">{tabError}</p>
              </div>
            )}

            {/* Loading State */}
            {tabLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading {activeTabConfig.label}...</p>
                </div>
              </div>
            )}

            {/* Component Container */}
            {!tabLoading && !tabError && (
              <div className="animate-fadeIn">
                {activeTabConfig.component}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PremiumHub;

