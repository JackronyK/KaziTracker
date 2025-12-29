// src/hooks/useResumePerformance.ts

/**
 * ============================================================================
 * useResumePerformance Hook - PRODUCTION READY
 * ============================================================================
 * Calculates resume performance metrics by combining resumes + applications data
 * Shows success rates, application counts, and journey tracking
 */

import { useState, useCallback, useMemo } from 'react';
import { logInfo, logError } from '../utils/errorLogger';
import type { Resume, Application } from '../types';

/**
 * Performance metrics for a single resume
 */
export interface ResumePerformanceMetrics {
  resumeId: number;
  filename: string;
  fileType: string;
  fileSizeKB: number;
  tags: string[];
  
  // Counts
  totalApplications: number;
  interviewCount: number;
  offerCount: number;
  rejectionCount: number;
  savedCount: number;
  appliedCount: number;
  
  // Rates (percentages)
  successRate: number;  // (interviews + offers) / total applications
  interviewRate: number; // interviews / total applications
  offerRate: number;    // offers / total applications
  rejectionRate: number; // rejections / total applications
  
  // Journey
  journey: string; // "5 apps → 2 interviews → 1 offer"
  
  // Meta
  createdAt: string;
  lastUsedDate?: string;
}

/**
 * Return type for useResumePerformance hook
 */
export interface UseResumePerformanceReturn {
  metrics: ResumePerformanceMetrics[];
  loading: boolean;
  error: string | null;
  
  // Statistics
  topPerformer: ResumePerformanceMetrics | null;
  averageSuccessRate: number;
  totalSuccessStories: number; // Total interviews + offers across all resumes
  
  // Actions
  calculateMetrics: (resumes: Resume[], applications: Application[]) => void;
}

/**
 * Custom hook for calculating resume performance metrics
 * 
 * Usage:
 * const { metrics, topPerformer, averageSuccessRate } = useResumePerformance();
 * 
 * Call calculateMetrics(resumes, applications) to update metrics
 */
export const useResumePerformance = (): UseResumePerformanceReturn => {
  const [metrics, setMetrics] = useState<ResumePerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate metrics for a single resume based on applications
   */
  const calculateResumeMetrics = useCallback(
    (resume: Resume, applications: Application[]): ResumePerformanceMetrics => {
      // Filter applications for this resume
        const resumeApps = Array.isArray(applications) 
        ? applications.filter(app => app?.resume_id === resume.id)
        : [];
      // Count applications by status
      const totalApplications = resumeApps.length;
      const appliedCount = resumeApps.filter(app => app.status === 'applied').length;
      const interviewCount = resumeApps.filter(app => app.status === 'interview').length;
      const offerCount = resumeApps.filter(app => app.status === 'offer').length;
      const rejectionCount = resumeApps.filter(app => app.status === 'rejected').length;
      const savedCount = resumeApps.filter(app => app.status === 'saved').length;

      // Calculate rates
      const successRate = totalApplications > 0 ? ((interviewCount + offerCount) / totalApplications) * 100 : 0;
      const interviewRate = totalApplications > 0 ? (interviewCount / totalApplications) * 100 : 0;
      const offerRate = totalApplications > 0 ? (offerCount / totalApplications) * 100 : 0;
      const rejectionRate = totalApplications > 0 ? (rejectionCount / totalApplications) * 100 : 0;

      // Create journey string
      const journey = `${totalApplications} app${totalApplications !== 1 ? 's' : ''} → ${interviewCount} interview${interviewCount !== 1 ? 's' : ''} → ${offerCount} offer${offerCount !== 1 ? 's' : ''}`;

      // Get last used date
      const lastUsedApp = resumeApps.length > 0 
        ? resumeApps.reduce((latest, app) => 
            new Date(app.created_at) > new Date(latest.created_at) ? app : latest
          )
        : null;

      // ✅ SAFETY: Handle tags safely
      let tagList: string[] = [];
      if (typeof resume.tags === 'string' && resume.tags) {
        tagList = resume.tags.split(',').map(t => t.trim()).filter(Boolean);
      } else if (Array.isArray(resume.tags)) {
        tagList = resume.tags.map(tag => String(tag)).filter(Boolean);
      }


      return {
        resumeId: resume.id,
        filename: resume.filename,
        fileType: resume.file_type.toUpperCase(),
        fileSizeKB: resume.file_size ? resume.file_size / 1024 : 0,
        tags: tagList,
        
        totalApplications,
        interviewCount,
        offerCount,
        rejectionCount,
        savedCount,
        appliedCount,
        
        successRate,
        interviewRate,
        offerRate,
        rejectionRate,
        
        journey,
        createdAt: resume.created_at,
        lastUsedDate: lastUsedApp?.created_at,
      };
    },
    []
  );

  /**
   * Main function to calculate all metrics
   */
  const calculateMetrics = useCallback(
    (resumes: Resume[], applications: Application[]) => {
      setLoading(true);
      setError(null);

      try {
        // ✅ SAFETY: Check if parameters are valid arrays
        if (!resumes || !Array.isArray(resumes)) {
          throw new Error('Invalid resumes data: expected array but got ' + typeof resumes);
        }
        
        if (!applications || !Array.isArray(applications)) {
          throw new Error('Invalid applications data: expected array but got ' + typeof applications);
        }

        logInfo('Calculating resume performance metrics', {
          resumeCount: resumes.length,
          applicationCount: applications.length,
        });

        // Calculate metrics for each resume
        const allMetrics = resumes.map(resume => {
          // ✅ SAFETY: Ensure resume is valid before processing
          if (!resume || typeof resume.id === 'undefined') {
            logError('Invalid resume object', null, { resume });
            return null;
          }
          return calculateResumeMetrics(resume, applications);
        }).filter(Boolean) as ResumePerformanceMetrics[];

        // Sort by success rate descending
        allMetrics.sort((a, b) => (b?.successRate || 0) - (a?.successRate || 0));

        setMetrics(allMetrics);
        logInfo('Resume performance metrics calculated successfully', {
          calculatedCount: allMetrics.length
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to calculate metrics';
        setError(message);
        logError('Failed to calculate resume performance metrics', err as Error);
        setMetrics([]); // Reset metrics on error
      } finally {
        setLoading(false);
      }
    },
    [calculateResumeMetrics]
  );
  /**
   * Compute top performer (memoized)
   */
  const topPerformer = useMemo(() => {
    if (metrics.length === 0) return null;
    return metrics[0]; // Already sorted by success rate
  }, [metrics]);

  /**
   * Compute average success rate (memoized)
   */
  const averageSuccessRate = useMemo(() => {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.successRate, 0);
    return sum / metrics.length;
  }, [metrics]);

  /**
   * Compute total success stories (interviews + offers)
   */
  const totalSuccessStories = useMemo(() => {
    return metrics.reduce((sum, m) => sum + m.interviewCount + m.offerCount, 0);
  }, [metrics]);

  return {
    metrics,
    loading,
    error,
    topPerformer,
    averageSuccessRate,
    totalSuccessStories,
    calculateMetrics,
  };
};

export default useResumePerformance;