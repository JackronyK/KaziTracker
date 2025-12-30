/**
 * ============================================================================
 * useApplications Hook - src/hooks/useApplications.ts
 * ============================================================================
 * Manages all application lifecycle and state
 */

import type { Application, ApplicationInput, ApplicationUpdate, UseApplicationsReturn } from '../types/index';
import { useState, useCallback } from 'react';
import { apiClient } from '../api/index';
import { logError, logInfo } from '../utils/errorLogger';


export const useApplications = (): UseApplicationsReturn => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all applications
   */
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Fetching applications');
      const data = await apiClient.listApplications();
      setApplications(data);
      logInfo('Applications fetched successfully', { count: data.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch applications';
      setError(message);
      logError('Failed to fetch applications', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new application
   */
  const createApplication = useCallback(
    async (app: ApplicationInput): Promise<Application | null> => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Creating application', { jobId: app.job_id });
        const newApp = await apiClient.createApplication(app);
        
        // Add to local state
        setApplications(prev => [newApp, ...prev]);
        logInfo('Application created successfully', { appId: newApp.id });
        
        return newApp;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create application';
        setError(message);
        logError('Failed to create application', err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update application (status, notes, dates, etc.)
   */
  const updateApplication = useCallback(
    async (id: number, updates: ApplicationUpdate): Promise<Application | null> => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Updating application', { appId: id, newStatus: updates.status });
        const updated = await apiClient.updateApplication(id, updates);
        
        // Update local state
        setApplications(prev => prev.map(a => a.id === id ? updated : a));
        logInfo('Application updated successfully', { appId: id });
        
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update application';
        setError(message);
        logError('Failed to update application', err as Error, { appId: id });
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Delete application
   */
  const deleteApplication = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Deleting application', { appId: id });
      await apiClient.deleteApplication(id);
      
      // Remove from local state
      setApplications(prev => prev.filter(a => a.id !== id));
      logInfo('Application deleted successfully', { appId: id });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete application';
      setError(message);
      logError('Failed to delete application', err as Error, { appId: id });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get single application
   */
  const getApplication = useCallback(async (id: number): Promise<Application | null> => {
    try {
      logInfo('Fetching application', { appId: id });
      return await apiClient.getApplication(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch application';
      setError(message);
      logError('Failed to fetch application', err as Error, { appId: id });
      return null;
    }
  }, []);

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    getApplication,
  };
};