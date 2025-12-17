/**
 * ============================================================================
 * useResumes Hook - src/hooks/useResumes.ts
 * ============================================================================
 * Manages resume upload, deletion, and tagging
 */

import { useState, useCallback } from 'react';
import type { Resume, UseResumesReturn } from '../types';
import { apiClient } from '../api';
import { logError, logInfo } from '../utils/errorLogger';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, ERROR_MESSAGES } from '../utils/constants';

export const useResumes = (): UseResumesReturn => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      const error = ERROR_MESSAGES.FILE_TOO_LARGE;
      logError('File validation failed', new Error(error), { 
        filename: file.name, 
        size: file.size 
      });
      return { valid: false, error };
    }

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!fileType || !ALLOWED_FILE_TYPES.includes(fileType)) {
      const error = ERROR_MESSAGES.INVALID_FILE_TYPE;
      logError('Invalid file type', new Error(error), { 
        filename: file.name, 
        type: fileType 
      });
      return { valid: false, error };
    }

    return { valid: true };
  }, []);

  /**
   * Fetch all resumes
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
   * Upload resume with validation
   */
  const uploadResume = useCallback(
    async (file: File, tags?: string): Promise<Resume | null> => {
      // Validate before uploading
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        logInfo('Uploading resume', { filename: file.name, size: file.size, tags });
        const newResume = await apiClient.uploadResume(file, tags);
        
        // Add to local state
        setResumes(prev => [newResume, ...prev]);
        logInfo('Resume uploaded successfully', { 
          resumeId: newResume.id, 
          filename: newResume.filename 
        });
        
        return newResume;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload resume';
        setError(message);
        logError('Failed to upload resume', err as Error, { filename: file.name });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [validateFile]
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
      setResumes(prev => prev.filter(r => r.id !== id));
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

  /**
   * Update resume tags
   */
  const updateResumeTags = useCallback(
    async (id: number, tags: string): Promise<Resume | null> => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Updating resume tags', { resumeId: id, tags });
        
        // Note: This assumes the backend has an update endpoint
        // If not, we'll need to add it
        // For now, we'll update local state optimistically
        const updated = resumes.find(r => r.id === id);
        if (updated) {
          updated.tags = tags;
          setResumes([...resumes]);
        }
        
        logInfo('Resume tags updated successfully', { resumeId: id });
        return updated || null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update tags';
        setError(message);
        logError('Failed to update resume tags', err as Error, { resumeId: id });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [resumes]
  );

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