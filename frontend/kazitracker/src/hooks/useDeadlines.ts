// src/hooks/useDeadlines.ts
import { useState, useCallback } from 'react';
import { logInfo, logError } from '../utils/errorLogger';
import type { Deadline } from '../types/Premium';
import { apiClient } from '../api';

export const useDeadlines = () => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeadlines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Fetching deadlines');
      const data = await apiClient.listDeadlines();
      setDeadlines(data);
      logInfo('Deadlines fetched successfully', { count: data.length });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      logError('Failed to fetch deadlines', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addDeadline = useCallback(
    async (deadlineData: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>) => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Adding new deadline', {
          title: (deadlineData as any).title,
          applicationId: (deadlineData as any).applicationId ?? (deadlineData as any).application_id,
        });

        const payload: any = {
          application_id:
            (deadlineData as any).applicationId ?? (deadlineData as any).application_id,
          title: (deadlineData as any).title,
          due_date: (deadlineData as any).dueDate ?? (deadlineData as any).due_date,
          type: (deadlineData as any).type ?? 'response',
          priority: (deadlineData as any).priority ?? 'medium',
          notes: (deadlineData as any).notes ?? null,
        };

        const newDeadline = await apiClient.createDeadline(payload);
        setDeadlines(prev => [...prev, newDeadline]);
        logInfo('Deadline added successfully', { id: newDeadline.id });
        return newDeadline;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        logError('Failed to add deadline', err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateDeadline = useCallback(
    async (id: number, updates: Partial<Deadline>) => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Updating deadline', { id });

        const body: any = { ...updates };
        if (body.dueDate && !body.due_date) {
          body.due_date = body.dueDate;
          delete body.dueDate;
        }

        const updated = await apiClient.updateDeadline(id, body);
        setDeadlines(prev => prev.map(d => (d.id === id ? updated : d)));
        logInfo('Deadline updated successfully', { id });
        return updated;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        logError('Failed to update deadline', err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteDeadline = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Deleting deadline', { id });
      await apiClient.deleteDeadline(id);
      setDeadlines(prev => prev.filter(d => d.id !== id));
      logInfo('Deadline deleted successfully', { id });
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      logError('Failed to delete deadline', err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUrgentDeadlines = useCallback(() => {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    return deadlines.filter(
      d => !d.completed && new Date((d as any).dueDate ?? (d as any).due_date) <= twoDaysFromNow
    );
  }, [deadlines]);

  return {
    deadlines,
    loading,
    error,
    fetchDeadlines,
    addDeadline,
    updateDeadline,
    deleteDeadline,
    getUrgentDeadlines,
  };
};
