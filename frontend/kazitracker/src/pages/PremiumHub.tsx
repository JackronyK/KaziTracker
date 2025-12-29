// src/pages/PremiumHub.tsx

/**
 * ============================================================================
 * PREMIUM HUB - PRODUCTION READY VERSION - FIXED
 * ============================================================================
 * Unified dashboard with proper data flow and state management
 * NOW INCLUDES: Resume Performance Tracking
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
import { logInfo, logError } from '../utils/errorLogger';

// components
import { InterviewScheduler } from '../components/Premium/InterviewScheduler'
import { OfferTracker } from '../components/Premium/OfferTracker';
import { DeadlineTracker } from '../components/Premium/DeadlineTracker';
import { ResumePerformance } from '../components/Premium/ResumePerformance';
import { ToastContainer } from '../components/ui/ToastContainer';


// Hooks
import { useInterviews } from '../hooks/useInterviews';
import { useOffers } from '../hooks/useOffers';
import { useDeadlines } from '../hooks/useDeadlines';
import { useResumes } from '../hooks/useResumes';
import { useApplications } from '../hooks/useApplications';
import { useToast } from '../hooks/useToast';


type PremiumHubTab = 'interviews' | 'offers' | 'deadlines' | 'resume';

interface TabConfig {
  id: PremiumHubTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  description: string;
}

interface PremiumHubProps {
  onNavigateToDashboard?: () => void;
}

/**
 * Premium Hub Page - FIXED VERSION
 *
 * Features:
 * ✅ Tabbed interface for all Phase 7 components
 * ✅ Real-time data from hooks
 * ✅ Quick stats overview with live badges
 * ✅ Resume Performance tracking (with real data)
 * ✅ Navigation back to dashboard
 * ✅ Responsive design
 * ✅ Error handling and loading states
 * ✅ Proper data fetching and state management
 */

export const PremiumHub = ({ onNavigateToDashboard }: PremiumHubProps) => {
  const [activeTab, setActiveTab] = useState<PremiumHubTab>('interviews');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // =========================================================================
  // HOOKS - Real Data Integration
  // =========================================================================

  const interviewHooks = useInterviews();
  const offerHooks = useOffers();
  const deadlineHooks = useDeadlines();
  const resumeHooks = useResumes();
  const applicationHooks = useApplications();
  const toast = useToast();

  // =========================================================================
  // FETCH DATA ON MOUNT
  // =========================================================================

  useEffect(() => {
    logInfo('Premium Hub mounted - fetching all data');
    
    const fetchAllData = async () => {
      try {
        // Fetch all data in parallel
        await Promise.all([
          interviewHooks.fetchInterviews(),
          offerHooks.fetchOffers(),
          deadlineHooks.fetchDeadlines(),
          resumeHooks.fetchResumes(),
          applicationHooks.fetchApplications(),
        ]);
        
        logInfo('All Premium Hub data loaded successfully');
        toast.success('Data loaded', 'Premium Hub is ready');
      } catch (err) {
        logError('Failed to load Premium Hub data', err as Error);
        toast.error('Failed to load data', 'Please refresh the page');
      }
    };

    fetchAllData();
  }, []); // Only fetch once on mount

  // =========================================================================
  // COMPUTE STATS
  // =========================================================================

  const urgentDeadlines = deadlineHooks.getUrgentDeadlines?.() || [];
  const overdueDeadlines = deadlineHooks.getOverdueDeadlines?.() || [];
  const pendingOffers = offerHooks.offers.filter((o) => o.status === 'pending').length;
  
  const upcomingInterviews = interviewHooks.interviews.filter((i) => {
    try {
      const interviewDate = new Date(i.date);
      const today = new Date();
      return interviewDate >= today;
    } catch {
      return false;
    }
  }).length;

  const stats = {
    interviews: upcomingInterviews,
    offers: pendingOffers,
    deadlines: deadlineHooks.deadlines.length,
    urgentDeadlines: urgentDeadlines.length,
    overdueDeadlines: overdueDeadlines.length,
  };

  // =========================================================================
  // TAB CONFIGURATION
  // =========================================================================

  const tabs: TabConfig[] = [
    {
      id: 'interviews',
      label: 'Interviews',
      icon: <Calendar className="w-5 h-5" />,
      badge: stats.interviews > 0 ? stats.interviews : undefined,
      description: 'Schedule and prepare for interviews',
    },
    {
      id: 'offers',
      label: 'Offers',
      icon: <DollarSign className="w-5 h-5" />,
      badge: stats.offers > 0 ? stats.offers : undefined,
      description: 'Track and negotiate job offers',
    },
    {
      id: 'deadlines',
      label: 'Deadlines',
      icon: <AlertCircle className="w-5 h-5" />,
      badge: stats.urgentDeadlines > 0 ? stats.urgentDeadlines : undefined,
      description: 'Stay on top of all deadlines',
    },
    {
      id: 'resume',
      label: 'Resume Performance',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Analyze which resumes perform best',
    },
  ];

  const activeTabConfig = tabs.find((t) => t.id === activeTab)!;

  // =========================================================================
  // LOADING & ERROR STATES
  // =========================================================================

  const tabLoading = 
    activeTab === 'interviews' ? interviewHooks.loading :
    activeTab === 'offers' ? offerHooks.loading :
    activeTab === 'deadlines' ? deadlineHooks.loading :
    activeTab === 'resume' ? (resumeHooks.loading || applicationHooks.loading) :
    false;

  const tabError = 
    activeTab === 'interviews' ? interviewHooks.error :
    activeTab === 'offers' ? offerHooks.error :
    activeTab === 'deadlines' ? deadlineHooks.error :
    activeTab === 'resume' ? (resumeHooks.error || applicationHooks.error) :
    null;

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleBackToDashboard = () => {
    logInfo('Premium Hub: Navigating back to dashboard');
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    } else {
      window.dispatchEvent(
        new CustomEvent('navigate', { detail: { tab: 'dashboard' } })
      );
    }
  };

  /**
   * Handle retry for failed data fetches
   */
  const handleRetry = async () => {
    logInfo('Premium Hub: Retrying data fetch for active tab');
    
    try {
      switch (activeTab) {
        case 'interviews':
          await interviewHooks.fetchInterviews();
          break;
        case 'offers':
          await offerHooks.fetchOffers();
          break;
        case 'deadlines':
          await deadlineHooks.fetchDeadlines();
          break;
        case 'resume':
          await Promise.all([
            resumeHooks.fetchResumes(),
            applicationHooks.fetchApplications(),
          ]);
          break;
      }
      toast.success('Retried', 'Data reloaded successfully');
    } catch (err) {
      logError('Retry failed', err as Error);
      toast.error('Retry failed', 'Please try again later');
    }
  };

  // =========================================================================
  // RENDER ACTIVE COMPONENT
  // =========================================================================

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'interviews':
        return (
          <InterviewScheduler
            {...interviewHooks}
            toast={toast}
          />
        );

      case 'offers':
        return (
          <OfferTracker
            {...offerHooks}
            toast={toast}
          />
        );

      case 'deadlines':
        return (
          <DeadlineTracker
            {...deadlineHooks}
            toast={toast}
          />
        );

      case 'resume':
        // Resume Performance Tab
        return (
          <ResumePerformance
            resumes={resumeHooks.resumes}
            applications={applicationHooks.applications}
            loading={tabLoading}
          />
        );

      default:
        return null;
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <>
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="flex h-full">
          

          {/*  SIDEBAR NAVIGATION  */}
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
                  title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    logInfo('Switching Premium Hub tab', { tab: tab.id });
                    setActiveTab(tab.id);
                  }}
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
                {sidebarOpen && (
                  <span className="font-medium text-sm">Back to Dashboard</span>
                )}
              </button>
            </div>
          </div>

          
          {/* MAIN CONTENT */}
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

              {/* Quick Stats */}
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

              {/* Overdue Deadlines Alert */}
              {activeTab !== 'deadlines' && stats.overdueDeadlines > 0 && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-medium text-red-800">
                      You have {stats.overdueDeadlines} overdue deadline{stats.overdueDeadlines > 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => setActiveTab('deadlines')}
                      className="ml-auto text-xs text-red-700 underline hover:text-red-900 font-medium"
                    >
                      View Deadlines
                    </button>
                  </div>
                </div>
              )}

              {/* Error State */}
              {tabError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">
                        ⚠️ Error loading {activeTabConfig.label.toLowerCase()}
                      </p>
                      <p className="text-xs text-red-600 mt-1">{tabError}</p>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="ml-4 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {tabLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">
                      Loading {activeTabConfig.label}...
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      This may take a moment
                    </p>
                  </div>
                </div>
              )}

              {/* Component Container */}
              {!tabLoading && !tabError && (
                <div className="animate-fadeIn">
                  {renderActiveComponent()}
                </div>
              )}

              {/* Empty State */}
              {!tabLoading && !tabError && activeTab === 'resume' && 
                resumeHooks.resumes.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                  <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 text-lg font-medium">
                    No resumes to track yet
                  </p>
                  <p className="text-gray-500 mt-2">
                    Upload resumes and create applications to see performance metrics
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />

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
    </>
  );
};

export default PremiumHub;