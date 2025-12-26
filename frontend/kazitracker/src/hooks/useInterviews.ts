// src/hooks/useInterviews.ts
import { useState, useCallback } from 'react';
import { logInfo, logError } from '../utils/errorLogger';
import type { Interview } from '../types/Premium';
import { apiClient } from '../api';

export const useInterviews = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Fetching interviews');
      const data = await apiClient.listInterviews();
      setInterviews(data);
      logInfo('Interviews fetched successfully', { count: data.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      logError('Failed to fetch interviews', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addInterview = useCallback(
    async (interviewData: Omit<Interview, 'id' | 'created_at' | 'updated_at'>) => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Adding new interview', {
          applicationId: (interviewData as any).applicationId || (interviewData as any).application_id,
          date: interviewData.date,
        });

        const payload = {
          application_id:
            (interviewData as any).applicationId ?? (interviewData as any).application_id,
          date: interviewData.date,
          time: (interviewData as any).time,
          type: (interviewData as any).type ?? 'phone',
          interviewer: (interviewData as any).interviewer ?? null,
          location: (interviewData as any).location ?? null,
          notes: (interviewData as any).notes ?? null,
          prep_checklist:
            (interviewData as any).prep_checklist ??
            (interviewData as any).prepChecklist ??
            null,
          reminders: (interviewData as any).reminders ?? true,
        };

        const newInterview = await apiClient.createInterview(payload);
        setInterviews(prev => [...prev, newInterview]);
        logInfo('Interview added successfully', { id: newInterview.id });
        return newInterview;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        logError('Failed to add interview', err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateInterview = useCallback(
    async (id: number, updates: Partial<Interview>) => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Updating interview', { id });

        const body: any = { ...updates };
        if (body.prepChecklist && !body.prep_checklist) {
          body.prep_checklist = body.prepChecklist;
          delete body.prepChecklist;
        }

        const updated = await apiClient.updateInterview(id, body);
        setInterviews(prev => prev.map(i => (i.id === id ? updated : i)));
        logInfo('Interview updated successfully', { id });
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        logError('Failed to update interview', err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteInterview = useCallback(
    async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Deleting interview', { id });
        await apiClient.deleteInterview(id);
        setInterviews(prev => prev.filter(i => i.id !== id));
        logInfo('Interview deleted successfully', { id });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        logError('Failed to delete interview', err as Error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    interviews,
    loading,
    error,
    fetchInterviews,
    addInterview,
    updateInterview,
    deleteInterview,
  };
};
