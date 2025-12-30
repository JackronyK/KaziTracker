// src/hooks/useResumes.ts

/**
 * ============================================================================
 * useResumes Hook - FIXED
 * ============================================================================
 * Manages all resume-related operations and state
 * Fixed tags handling to use strings instead of arrays
 */

import { useState, useCallback } from 'react';
import { logInfo, logError } from '../utils/errorLogger';
import type { Resume, UseResumesReturn } from '../types';
import { apiClient } from '../api/index';

export const useResumes = (): UseResumesReturn => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all resumes from API
   */
  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Fetching resumes');
      const data = await apiClient.listResumes();
      setResumes(data);
      logInfo('Resumes fetched successfully', { count: data.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch resumes';
      setError(message);
      logError('Failed to fetch resumes', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload new resume
   */
  const uploadResume = useCallback(
    async (file: File, tags?: string): Promise<Resume | null> => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Uploading resume', { filename: file.name, size: file.size });
        const newResume = await apiClient.uploadResume(file, tags);

        // Add to local state
        setResumes((prev) => [newResume, ...prev]);
        logInfo('Resume uploaded successfully', { resumeId: newResume.id });

        return newResume;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload resume';
        setError(message);
        logError('Failed to upload resume', err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Update resume tags
   * @param id - Resume ID
   * @param tags - Comma-separated tag string
   */
  const updateResumeTags = useCallback(
    async (id: number, tags: string): Promise<Resume | null> => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Updating resume tags', { resumeId: id, tags });
        
        // Convert comma-separated string to array for API
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        const updated = await apiClient.updateResumeTags(id, tagArray);

        // Update local state
        setResumes((prev) => prev.map((r) => (r.id === id ? updated : r)));
        logInfo('Resume tags updated successfully', { resumeId: id });

        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update tags';
        setError(message);
        logError('Failed to update resume tags', err as Error, { resumeId: id });
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );


  /**
   * Delete resume
   */
  const deleteResume = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Deleting resume', { resumeId: id });
      await apiClient.deleteResume(id);

      // Remove from local state
      setResumes((prev) => prev.filter((r) => r.id !== id));
      logInfo('Resume deleted successfully', { resumeId: id });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete resume';
      setError(message);
      logError('Failed to delete resume', err as Error, { resumeId: id });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    resumes,
    loading,
    error,
    fetchResumes,
    uploadResume,
    deleteResume,
    updateResumeTags,
  };
};