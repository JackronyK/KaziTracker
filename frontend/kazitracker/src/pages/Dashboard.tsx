// src/pages/Dashboard.tsx

/**
 * Dashboard Page (Placeholder for Phase 6)
 * This is where the analytics dashboard will be built
 */

import { BarChart3 } from 'lucide-react';
import type { NavTab } from '../components/Layout/Sidebar';

interface DashboardPageProps {
  activeTab?: NavTab;
}

/**
 * Dashboard Page Component
 * 
 * Placeholder for Phase 6
 * Will contain:
 * - Analytics cards
 * - Status breakdown charts
 * - Recent activity timeline
 * - Key metrics
 */
export const DashboardPage = ({ activeTab = 'dashboard' }: DashboardPageProps) => {
  return (
    <div className="h-full p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your job application overview.</p>
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Placeholder Cards */}
        {[
          { label: 'Total Applications', value: '--' },
          { label: 'This Month', value: '--' },
          { label: 'Interviews', value: '--' },
          { label: 'Offer Rate', value: '--' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
            <p className="text-xs text-gray-500 mt-2">📊 Phase 6: Analytics</p>
          </div>
        ))}
      </div>

      {/* Placeholder Chart Area */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 text-center py-12">
        <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 font-medium">Analytics Dashboard</p>
        <p className="text-gray-500 text-sm mt-2">
          📊 Coming in Phase 6: Charts, timelines, and insights
        </p>
      </div>

      {/* Navigation Hint */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 Use the sidebar to navigate to <strong>Jobs</strong>, <strong>Applications</strong>, or <strong>Resumes</strong>
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;