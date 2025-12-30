/**
 * ============================================================================
 * useAnalytics Hook - src/hooks/useAnalytics.ts
 * ============================================================================
 * Manages analytics data and smart insights with dynamic date ranges
 */

import type { 
  ApplicationStats, 
  TimelineEntry, 
  ResumePerformance, 
  ActivityLog, 
  AnalyticsFilter,
  DateRangeType,
  UseAnalyticsReturn,
  Application,
  Job,
} from '../types';
import { formatDate } from '../utils/formatters';
import { logInfo, logError } from '../utils/errorLogger';

/**
 * Calculate analytics from applications data
 * This is done client-side for real-time updates
 */
const calculateAnalytics = (
  applications: Application[],
  jobs: Job[],
  filter: AnalyticsFilter
): ApplicationStats => {
  const now = new Date();
  const startDate = getStartDate(filter.range);
  
  // Filter applications by date range
  const filtered = applications.filter(app => {
    const appDate = new Date(app.created_at);
    return appDate >= startDate && appDate <= now;
  });

  // Count by status
  const byStatus = {
    saved: filtered.filter(a => a.status === 'saved').length,
    applied: filtered.filter(a => a.status === 'applied').length,
    interview: filtered.filter(a => a.status === 'interview').length,
    offer: filtered.filter(a => a.status === 'offer').length,
    rejected: filtered.filter(a => a.status === 'rejected').length,
  };

  const total = filtered.length;
  const interviews = byStatus.interview + byStatus.offer;
  const offers = byStatus.offer;

  // Calculate rates
  const interviewRate = total > 0 ? interviews / total : 0;
  const offerRate = total > 0 ? offers / total : 0;

  // Count expired deadlines (applications that passed deadline)
  let expiredCount = 0;
  filtered.forEach(app => {
    const job = jobs.find(j => j.id === app.job_id);
    // Deadline logic would go here (not implemented yet)
  });

  return {
    total,
    by_status: byStatus,
    last_30_days: applications.filter(a => {
      const days30ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return new Date(a.created_at) >= days30ago;
    }).length,
    interview_rate: interviewRate,
    offer_rate: offerRate,
    expired_deadlines: expiredCount,
  };
};

/**
 * Get start date based on range type
 */
const getStartDate = (range: DateRangeType): Date => {
  const now = new Date();
  
  switch (range) {
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return new Date(0); // Beginning of time
  }
};

/**
 * Generate timeline data for charts
 */
const generateTimeline = (
  applications: Application[],
  range: DateRangeType
): TimelineEntry[] => {
  const timeline: Map<string, TimelineEntry> = new Map();
  const startDate = getStartDate(range);
  
  applications.forEach(app => {
    const appDate = new Date(app.created_at);
    if (appDate < startDate) return;
    
    const dateKey = formatDate(appDate);
    
    if (!timeline.has(dateKey)) {
      timeline.set(dateKey, {
        date: dateKey,
        saved: 0,
        applied: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
      });
    }
    
    const entry = timeline.get(dateKey)!;
    entry[app.status as keyof Omit<TimelineEntry, 'date'>]++;
  });
  
  return Array.from(timeline.values()).sort((a, b) => {
    const [dA, mA, yA] = a.date.split('/').map(Number);
    const [dB, mB, yB] = b.date.split('/').map(Number);
    return new Date(yA, mA - 1, dA).getTime() - new Date(yB, mB - 1, dB).getTime();
  });
};

/**
 * Calculate resume performance metrics
 */
const calculateResumePerformance = (
  applications: Application[],
  resumes: Resume[]
): ResumePerformance[] => {
  const performance: Map<number, ResumePerformance> = new Map();
  
  applications.forEach(app => {
    if (!app.resume_id) return;
    
    const resume = resumes.find(r => r.id === app.resume_id);
    if (!resume) return;
    
    if (!performance.has(app.resume_id)) {
      performance.set(app.resume_id, {
        resume_id: app.resume_id,
        filename: resume.filename,
        total_used: 0,
        interviews_received: 0,
        offers_received: 0,
        interview_rate: 0,
        offer_rate: 0,
      });
    }
    
    const perf = performance.get(app.resume_id)!;
    perf.total_used++;
    
    if (app.status === 'interview' || app.status === 'offer') {
      perf.interviews_received++;
    }
    
    if (app.status === 'offer') {
      perf.offers_received++;
    }
    
    perf.interview_rate = perf.total_used > 0 ? perf.interviews_received / perf.total_used : 0;
    perf.offer_rate = perf.total_used > 0 ? perf.offers_received / perf.total_used : 0;
  });
  
  return Array.from(performance.values());
};

export const useAnalytics = (
  applications: Application[],
  jobs: Job[],
  resumes: Resume[]
): UseAnalyticsReturn => {
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [resumePerformance, setResumePerformance] = useState<ResumePerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch analytics for given date range (dynamic)
   */
  const fetchAnalytics = useCallback(async (filter: AnalyticsFilter) => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Calculating analytics', { range: filter.range });
      
      // Calculate stats
      const calculatedStats = calculateAnalytics(applications, jobs, filter);
      setStats(calculatedStats);
      
      // Generate timeline
      const timelineData = generateTimeline(applications, filter.range);
      setTimeline(timelineData);
      
      // Calculate resume performance
      const resumePerf = calculateResumePerformance(applications, resumes);
      setResumePerformance(resumePerf);
      
      logInfo('Analytics calculated successfully', { 
        total: calculatedStats.total,
        range: filter.range 
      });
    } catch (err) {
      const message = 'Failed to calculate analytics';
      setError(message);
      logError(message, err as Error);
    } finally {
      setLoading(false);
    }
  }, [applications, jobs, resumes]);

  /**
   * Get stats for specific date range
   */
  const getStatsByRange = useCallback(
    async (range: DateRangeType): Promise<ApplicationStats | null> => {
      try {
        const filter: AnalyticsFilter = { range };
        await fetchAnalytics(filter);
        return calculateAnalytics(applications, jobs, filter);
      } catch (err) {
        logError('Failed to get stats by range', err as Error, { range });
        return null;
      }
    },
    [applications, jobs, fetchAnalytics]
  );

  return {
    stats,
    timeline,
    resumePerformance,
    recentActivity,
    loading,
    error,
    fetchAnalytics,
    getStatsByRange,
  };
};