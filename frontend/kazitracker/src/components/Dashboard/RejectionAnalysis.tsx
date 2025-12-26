// src/components/applications/RejectionModal.tsx
/**
 * RejectionAnalysis Component (Phase 7)
 * Analyze rejection patterns and provide insights
 */

import type { Application } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RejectionAnalysisProps {
  applications: Application[];
}

/**
 * RejectionAnalysis Component
 * 
 * Features:
 * - Categorize rejection reasons
 * - Show statistics
 * - Provide actionable insights
 * - Track improvement over time
 */
export const RejectionAnalysis = ({ applications }: RejectionAnalysisProps) => {
  // Get rejected applications with reasons
  const rejectedApps = applications.filter(
    (app) => app.status === 'Rejected' && app.rejection_reason
  );

  // Analyze rejection reasons
  const rejectionStats = rejectedApps.reduce(
    (acc, app) => {
      const reason = app.rejection_reason || 'Unknown';
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Convert to chart data
  const chartData = Object.entries(rejectionStats)
    .map(([reason, count]) => ({
      name: reason,
      value: count,
      percentage: Math.round((count / rejectedApps.length) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  // Colors for pie chart
  const COLORS = [
    '#EF4444', // red
    '#F97316', // orange
    '#EAB308', // yellow
    '#84CC16', // lime
    '#06B6D4', // cyan
    '#8B5CF6', // purple
  ];

  // Get insights
  const getInsights = () => {
    const insights = [];

    if (chartData.length === 0) {
      return ['✅ No rejections yet! Keep applying and learning.'];
    }

    const topReason = chartData[0];
    insights.push(`📊 Most common reason: "${topReason.name}" (${topReason.percentage}%)`);

    // Specific recommendations based on top reason
    if (topReason.name.includes('Overqualified')) {
      insights.push(
        '💡 Tailor your resume to highlight only relevant experience for the role level'
      );
      insights.push(
        '🎯 In cover letter, express genuine interest in the specific role and company'
      );
    } else if (topReason.name.includes('Underqualified')) {
      insights.push(
        '📚 Build skills through online courses (Coursera, Udemy, etc.)'
      );
      insights.push(
        '🔧 Create projects that demonstrate your ability to learn quickly'
      );
    } else if (topReason.name.includes('Budget')) {
      insights.push(
        '💰 Research market rates for your position and location'
      );
      insights.push(
        '🤝 Be open to negotiation and discuss total compensation package'
      );
    } else if (topReason.name.includes('Culture')) {
      insights.push(
        '🤝 Research company culture during interview process'
      );
      insights.push(
        '❓ Ask questions about team values and working style'
      );
    } else if (topReason.name.includes('Already')) {
      insights.push(
        '✨ This is common! Keep applying to more positions'
      );
      insights.push(
        '🔔 Consider asking to be notified about similar future openings'
      );
    }

    // Overall stats
    const totalRejections = rejectedApps.length;
    const totalApps = applications.filter((a) => a.status !== 'Saved').length;
    const rejectionRate = totalApps > 0 ? Math.round((totalRejections / totalApps) * 100) : 0;

    insights.push(
      `📈 Rejection rate: ${rejectionRate}% (${totalRejections} of ${totalApps} applications)`
    );

    return insights;
  };

  const getEncouragement = () => {
    const stats = {
      total: applications.length,
      rejected: rejectedApps.length,
      interviews: applications.filter((a) => a.status === 'Interview').length,
      offers: applications.filter((a) => a.status === 'Offer').length,
    };

    if (stats.offers > 0) {
      return `🎉 You have ${stats.offers} offer(s)! Rejections are just part of the journey.`;
    }
    if (stats.interviews > 0) {
      return `🚀 You have ${stats.interviews} interview(s) scheduled! You're making progress.`;
    }
    if (stats.rejected < 5) {
      return `💪 Keep pushing! Every rejection is feedback to improve.`;
    }
    return `🌟 Persistence is key. Learn from rejections and keep applying!`;
  };

  if (rejectedApps.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-lg">No rejections yet! 🎯</p>
        <p className="text-gray-400 mt-2">When you get rejections, we'll analyze them here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>📊</span>
        Rejection Analysis
      </h3>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-center h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} rejection(s)`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Table */}
          <div className="mt-6 space-y-2">
            {chartData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></div>
                  <span className="font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-600">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-3">💡 Key Insights</h4>
        <ul className="space-y-2">
          {getInsights().map((insight, idx) => (
            <li key={idx} className="text-sm text-blue-800">
              {insight}
            </li>
          ))}
        </ul>
      </div>

      {/* Encouragement */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          <span className="font-semibold">Remember:</span> {getEncouragement()}
        </p>
      </div>

      {/* Action Items */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-900 mb-2">✅ Next Steps</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>1. Update your resume to better match the roles you're targeting</li>
          <li>2. Research companies before applying to ensure culture fit</li>
          <li>3. Practice your interview skills to convert more interviews to offers</li>
          <li>4. Keep applying! Success comes from persistence</li>
        </ul>
      </div>
    </div>
  );
};

export default RejectionAnalysis;