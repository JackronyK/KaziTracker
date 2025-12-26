// src/hooks/useResumes.ts
import { useState, useCallback } from 'react';
import { logInfo, logError } from '../utils/errorLogger';
import type { Resume } from '../types';
import { apiClient } from '../api';

export const useResumes = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const uploadResume = useCallback(async (file: File, tags?: string) => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Uploading resume', { filename: file.name });
      const uploaded = await apiClient.uploadResume(file, tags);
      setResumes(prev => [...prev, uploaded]);
      logInfo('Resume uploaded', { id: uploaded.id });
      return uploaded;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload resume';
      setError(message);
      logError('Failed to upload resume', err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateResumeTags = useCallback(async (id: number, tags: string[]) => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Updating resume tags', { resumeId: id });
      const updated = await apiClient.updateResumeTags(id, tags);
      setResumes(prev => prev.map(r => (r.id === id ? updated : r)));
      logInfo('Resume tags updated', { resumeId: id });
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update resume tags';
      setError(message);
      logError('Failed to update resume tags', err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteResume = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Deleting resume', { resumeId: id });
      await apiClient.deleteResume(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      logInfo('Resume deleted', { resumeId: id });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete resume';
      setError(message);
      logError('Failed to delete resume', err as Error);
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
    updateResumeTags,
    deleteResume,
  };
};
