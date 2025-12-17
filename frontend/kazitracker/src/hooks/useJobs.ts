/**
 * ============================================================================
 * useJobs Hook - src/hooks/useJobs.ts
 * ============================================================================
 * Manages all job-related operations and state
 */

import { useState, useCallback } from 'react';
import type { Job, JobInput, ParsedJD, UseJobsReturn } from '../types';
import { apiClient } from '../api';
import { logError, logInfo } from '../utils/errorLogger';

export const useJobs = (): UseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all jobs from API
   */
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Fetching jobs');
      const data = await apiClient.listJobs();
      setJobs(data);
      logInfo('Jobs fetched successfully', { count: data.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(message);
      logError('Failed to fetch jobs', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new job
   */
  const createJob = useCallback(async (job: JobInput): Promise<Job | null> => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Creating job', { company: job.company });
      const newJob = await apiClient.createJob(job);
      
      // Add to local state
      setJobs(prev => [newJob, ...prev]);
      logInfo('Job created successfully', { jobId: newJob.id });
      
      return newJob;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create job';
      setError(message);
      logError('Failed to create job', err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update job
   */
  const updateJob = useCallback(
    async (id: number, jobUpdates: Partial<JobInput>): Promise<Job | null> => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Updating job', { jobId: id });
        const updated = await apiClient.updateJob(id, jobUpdates);
        
        // Update local state
        setJobs(prev => prev.map(j => j.id === id ? updated : j));
        logInfo('Job updated successfully', { jobId: id });
        
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update job';
        setError(message);
        logError('Failed to update job', err as Error, { jobId: id });
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Delete job
   */
  const deleteJob = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Deleting job', { jobId: id });
      await apiClient.deleteJob(id);
      
      // Remove from local state
      setJobs(prev => prev.filter(j => j.id !== id));
      logInfo('Job deleted successfully', { jobId: id });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete job';
      setError(message);
      logError('Failed to delete job', err as Error, { jobId: id });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get single job
   */
  const getJob = useCallback(async (id: number): Promise<Job | null> => {
    try {
      logInfo('Fetching job', { jobId: id });
      return await apiClient.getJob(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch job';
      setError(message);
      logError('Failed to fetch job', err as Error, { jobId: id });
      return null;
    }
  }, []);

  /**
   * Parse job description
   */
  const parseJD = useCallback(
    async (rawJd: string, url?: string): Promise<ParsedJD | null> => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Parsing job description');
        const parsed = await apiClient.parseJD(rawJd, url);
        logInfo('Job description parsed successfully', { 
          confidence: parsed.confidence,
          skillsFound: parsed.skills.length 
        });
        return parsed;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to parse job description';
        setError(message);
        logError('Failed to parse job description', err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    getJob,
    parseJD,
  };
};