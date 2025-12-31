// ============================================================================
// src/hooks/useDeadlines.ts
// ============================================================================
import { useState, useCallback } from 'react';
import { logInfo, logError } from '../utils/errorLogger';
import { apiClient } from '../api';
import type { Deadline } from '../types/Premium';

export interface UseDeadlinesReturn {
  deadlines: Deadline[];
  loading: boolean;
  error: string | null;
  operationLoading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  fetchDeadlines: () => Promise<void>;
  addDeadline: (data: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>) => Promise<Deadline | null>;
  updateDeadline: (id: number, updates: Partial<Deadline>) => Promise<Deadline | null>;
  deleteDeadline: (id: number) => Promise<boolean>;
  toggleDeadlineComplete: (id: number) => Promise<boolean>;
  getUrgentDeadlines: () => Deadline[];
  getOverdueDeadlines: () => Deadline[];
  clearError: () => void;
}

export const useDeadlines = (): UseDeadlinesReturn => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState({
    fetch: false,
    create: false,
    update: false,
    delete: false,
  });

  const clearError = useCallback(() => setError(null), []);

  const fetchDeadlines = useCallback(async () => {
    setOperationLoading(prev => ({ ...prev, fetch: true }));
    setLoading(true);
    setError(null);
    
    try {
      logInfo('Fetching deadlines');
      const data = await apiClient.listDeadlines();
      setDeadlines(data);
      logInfo('Deadlines fetched successfully', { count: data.length });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch deadlines';
      setError(errorMsg);
      logError('Failed to fetch deadlines', err as Error);
    } finally {
      setLoading(false);
      setOperationLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  const addDeadline = useCallback(
    async (deadlineData: Omit<Deadline, 'id' | 'created_at' | 'updated_at'>) => {
      setOperationLoading(prev => ({ ...prev, create: true }));
      setError(null);

      const optimisticDeadline: Deadline = {
        ...(deadlineData as any),
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed: false,
      };

      setDeadlines(prev => [optimisticDeadline, ...prev]);

      try {
        logInfo('Adding new deadline', { title: (deadlineData as any).title });

        // FIXED: Proper type conversion for API
        const applicationId = (deadlineData as any).applicationId ?? (deadlineData as any).application_id;

        // Validate application_id
        if (!applicationId || applicationId === '' || isNaN(Number(applicationId))) {
          throw new Error('Application ID is required and must be a valid number');
        }

        const payload: any = {
          application_id: Number(applicationId), // Convert to number
          title: (deadlineData as any).title,
          due_date: (deadlineData as any).dueDate ?? (deadlineData as any).due_date,
          type: (deadlineData as any).type ?? 'response',
          priority: (deadlineData as any).priority ?? 'medium',
          notes: (deadlineData as any).notes ?? null,
        };

        logInfo('Deadline payload:', payload);

        const newDeadline = await apiClient.createDeadline(payload);
        
        setDeadlines(prev => 
          prev.map(d => d.id === optimisticDeadline.id ? newDeadline : d)
        );
        
        logInfo('Deadline added successfully', { id: newDeadline.id });
        return newDeadline;
      } catch (err) {
        setDeadlines(prev => prev.filter(d => d.id !== optimisticDeadline.id));
        
        const errorMsg = err instanceof Error ? err.message : 'Failed to add deadline';
        setError(errorMsg);
        logError('Failed to add deadline', err as Error);
        return null;
      } finally {
        setOperationLoading(prev => ({ ...prev, create: false }));
      }
    },
    []
  );

  const updateDeadline = useCallback(
    async (id: number, updates: Partial<Deadline>) => {
      setOperationLoading(prev => ({ ...prev, update: true }));
      setError(null);

      const original = deadlines.find(d => d.id === id);
      if (!original) {
        setError('Deadline not found');
        return null;
      }

      setDeadlines(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));

      try {
        logInfo('Updating deadline', { id });

        const body: any = { ...updates };
        
        // Handle date conversion
        if (body.dueDate && !body.due_date) {
          body.due_date = body.dueDate;
          delete body.dueDate;
        }

        // Handle application_id
        if (body.applicationId) {
          body.application_id = Number(body.applicationId);
          delete body.applicationId;
        } else if (body.application_id) {
          body.application_id = Number(body.application_id);
        }

        const updated = await apiClient.updateDeadline(id, body);
        setDeadlines(prev => prev.map(d => (d.id === id ? updated : d)));
        logInfo('Deadline updated successfully', { id });
        return updated;
      } catch (err) {
        setDeadlines(prev => prev.map(d => (d.id === id ? original : d)));
        
        const errorMsg = err instanceof Error ? err.message : 'Failed to update deadline';
        setError(errorMsg);
        logError('Failed to update deadline', err as Error);
        return null;
      } finally {
        setOperationLoading(prev => ({ ...prev, update: false }));
      }
    },
    [deadlines]
  );

  const deleteDeadline = useCallback(async (id: number) => {
    setOperationLoading(prev => ({ ...prev, delete: true }));
    setError(null);

    const original = deadlines.find(d => d.id === id);
    if (!original) {
      setError('Deadline not found');
      return false;
    }

    setDeadlines(prev => prev.filter(d => d.id !== id));

    try {
      logInfo('Deleting deadline', { id });
      await apiClient.deleteDeadline(id);
      logInfo('Deadline deleted successfully', { id });
      return true;
    } catch (err) {
      setDeadlines(prev => [...prev, original].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete deadline';
      setError(errorMsg);
      logError('Failed to delete deadline', err as Error);
      return false;
    } finally {
      setOperationLoading(prev => ({ ...prev, delete: false }));
    }
  }, [deadlines]);

  const toggleDeadlineComplete = useCallback(
    async (id: number) => {
      const deadline = deadlines.find(d => d.id === id);
      if (!deadline) return false;

      return !!(await updateDeadline(id, { completed: !deadline.completed }));
    },
    [deadlines, updateDeadline]
  );

  const getUrgentDeadlines = useCallback(() => {
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    return deadlines.filter(
      d => !d.completed && new Date((d as any).dueDate ?? (d as any).due_date) <= twoDaysFromNow
    );
  }, [deadlines]);

  const getOverdueDeadlines = useCallback(() => {
    const now = new Date();
    return deadlines.filter(
      d => !d.completed && new Date((d as any).dueDate ?? (d as any).due_date) < now
    );
  }, [deadlines]);

  return {
    deadlines,
    loading,
    error,
    operationLoading,
    fetchDeadlines,
    addDeadline,
    updateDeadline,
    deleteDeadline,
    toggleDeadlineComplete,
    getUrgentDeadlines,
    getOverdueDeadlines,
    clearError,
  };
};