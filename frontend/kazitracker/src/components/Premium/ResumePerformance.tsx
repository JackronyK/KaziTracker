// src/components/premium/ResumePerformance.tsx

/**
 * ============================================================================
 * RESUME PERFORMANCE - PRODUCTION READY ✅
 * ============================================================================
 * Analytics dashboard for resume success tracking with CV Journey visualization
 * Real metrics from applications data
 */

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  FileText,
  Activity,
  ArrowRight,
  Trophy,
  Zap,
} from 'lucide-react';
import { useResumePerformance, type ResumePerformanceMetrics } from '../../hooks/useResumePerformance';
import type { Resume, Application } from '../../types';
import { logInfo } from '../../utils/errorLogger';

interface ResumePerformanceProps {
  resumes: Resume[];
  applications: Application[];
  loading: boolean;
}

/**
 * ResumePerformance Component
 * 
 * Props:
 * - resumes: Array of resume objects
 * - applications: Array of application objects
 * - loading: Loading state
 * 
 * Features:
 * ✅ Real metrics from applications data
 * ✅ CV Journey visualization (apps → interviews → offers)
 * ✅ Success rates per resume
 * ✅ Top performer badge
 * ✅ Average performance stats
 * ✅ Total success stories
 * ✅ Production-ready
 */
export const ResumePerformance = ({
  resumes,
  applications,
  loading: externalLoading,
}: ResumePerformanceProps) => {
  const {
    metrics,
    loading: metricsLoading,
    error,
    topPerformer,
    averageSuccessRate,
    totalSuccessStories,
    calculateMetrics,
  } = useResumePerformance();

  const [expandedResume, setExpandedResume] = useState<number | null>(null);

  // =========================================================================
  // LIFECYCLE
  // =========================================================================

  // Calculate metrics whenever resumes or applications change

  useEffect(() => {
    // ✅ SAFETY: Only calculate if both arrays are valid
    if (resumes && Array.isArray(resumes) && applications && Array.isArray(applications)) {
      logInfo('Calculating resume performance metrics', {
        resumeCount: resumes.length,
        applicationCount: applications.length,
      });
      
      // ✅ Call the hook's function to recalculate
      calculateMetrics(resumes, applications);
    }
    // If no resumes, we don't need to calculate (hook will handle empty state)
  }, [resumes, applications, calculateMetrics]);
  
  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  const isLoading = externalLoading || metricsLoading;
  const hasData = metrics.length > 0;

  /**
   * Get color for success rate
   */
  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 50) return 'text-green-600 bg-green-50';
    if (rate >= 30) return 'text-orange-600 bg-orange-50';
    if (rate > 0) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  /**
   * Get journey segment color
   */
  /*
  const getJourneySegmentColor = (index: number): string => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500'];
    return colors[index % colors.length];
  }; */

  /**
   * Render CV Journey visualization
   */
  const renderCVJourney = (metric: ResumePerformanceMetrics) => {
    const segments = [
      { label: metric.totalApplications, unit: 'App', color: 'bg-blue-500' },
      { label: metric.interviewCount, unit: 'Int', color: 'bg-purple-500' },
      { label: metric.offerCount, unit: 'Off', color: 'bg-green-500' },
    ];

    return (
      <div className="flex items-center gap-2 my-3">
        {segments.map((segment, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {/* Segment */}
            <div className="flex items-center gap-1">
              <div className={`w-8 h-8 ${segment.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                {segment.label}
              </div>
              <span className="text-xs text-gray-600 font-medium">{segment.unit}</span>
            </div>

            {/* Arrow (except last) */}
            {idx < segments.length - 1 && (
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    );
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
        <TrendingUp className="w-6 h-6 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resume Performance</h2>
          <p className="text-sm text-gray-600 mt-1">
            Track which resumes perform best across your applications
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating performance metrics...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm text-red-700">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasData && (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">
            {resumes.length === 0 ? 'No resumes yet' : 'No applications yet'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {resumes.length === 0
              ? 'Upload resumes to start tracking performance'
              : 'Create applications and select a resume to track performance'}
          </p>
        </div>
      )}

      {/* Data Section */}
      {!isLoading && hasData && (
        <>
          {/* Top Performer Banner */}
          {topPerformer && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <Trophy className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-900 mb-2">
                    🏆 Best Performing Resume
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {topPerformer.filename}
                  </h3>
                  
                  {/* Journey */}
                  {renderCVJourney(topPerformer)}
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-purple-600 font-semibold uppercase">Success Rate</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {topPerformer.successRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-semibold uppercase">Interviews</p>
                      <p className="text-2xl font-bold text-purple-900 mt-1">
                        {topPerformer.interviewCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-600 font-semibold uppercase">Offers</p>
                      <p className="text-2xl font-bold text-green-600 mt-1">
                        {topPerformer.offerCount}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {topPerformer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {topPerformer.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Average Success Rate */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-blue-900 font-semibold uppercase tracking-wide mb-2">
                    📊 Avg Performance
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {averageSuccessRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    Across {metrics.length} resume{metrics.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Activity className="w-6 h-6 text-blue-400 flex-shrink-0" />
              </div>
            </div>

            {/* Total Success Stories */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-green-900 font-semibold uppercase tracking-wide mb-2">
                    🎯 Success Stories
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {totalSuccessStories}
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    Interviews + Offers combined
                  </p>
                </div>
                <Zap className="w-6 h-6 text-green-400 flex-shrink-0" />
              </div>
            </div>

            {/* Total Applications */}
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-indigo-900 font-semibold uppercase tracking-wide mb-2">
                    📤 Total Apps
                  </p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {metrics.reduce((sum, m) => sum + m.totalApplications, 0)}
                  </p>
                  <p className="text-xs text-indigo-700 mt-2">
                    Across all resumes
                  </p>
                </div>
                <FileText className="w-6 h-6 text-indigo-400 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Resume Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Resume</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">CV Journey</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">Success Rate</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">Interview Rate</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">Offer Rate</th>
                  <th className="text-center py-4 px-4 font-semibold text-gray-700">Rejection Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr
                    key={metric.resumeId}
                    className={`border-b border-gray-200 transition-colors cursor-pointer ${
                      expandedResume === metric.resumeId ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() =>
                      setExpandedResume(
                        expandedResume === metric.resumeId ? null : metric.resumeId
                      )
                    }
                  >
                    {/* Resume Info */}
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          {metric.filename}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {metric.fileType} • {(metric.fileSizeKB / 1024).toFixed(1)} MB
                        </p>
                        {metric.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {metric.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* CV Journey */}
                    <td className="text-center py-4 px-4">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {metric.totalApplications}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {metric.interviewCount}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          {metric.offerCount}
                        </span>
                      </div>
                    </td>

                    {/* Success Rate */}
                    <td className="text-center py-4 px-4">
                      <span
                        className={`px-3 py-1.5 rounded-full font-bold text-sm ${getSuccessRateColor(
                          metric.successRate
                        )}`}
                      >
                        {metric.successRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Interview Rate */}
                    <td className="text-center py-4 px-4">
                      <span className="text-blue-600 font-semibold">
                        {metric.interviewRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Offer Rate */}
                    <td className="text-center py-4 px-4">
                      <span className="text-green-600 font-semibold">
                        {metric.offerRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Rejection Rate */}
                    <td className="text-center py-4 px-4">
                      <span className="text-red-600 font-semibold">
                        {metric.rejectionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              💡 <span className="font-medium">Tip:</span> Click on a resume row to see detailed metrics. Higher success rates indicate which CVs are most effective with your target roles.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ResumePerformance;