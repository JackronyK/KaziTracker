
// src/hooks/useInterviews.ts
import { useState, useCallback } from 'react';
import { logInfo, logError } from '../utils/errorLogger';
import type { Interview } from '../types/Premium';
import { apiClient } from '../api';

export interface UseInterviewsReturn {
  interviews: Interview[];
  loading: boolean;
  error: string | null;
  operationLoading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  fetchInterviews: () => Promise<void>;
  addInterview: (data: Omit<Interview, 'id' | 'created_at' | 'updated_at'>) => Promise<Interview | null>;
  updateInterview: (id: number, updates: Partial<Interview>) => Promise<Interview | null>;
  deleteInterview: (id: number) => Promise<boolean>;
  togglePrepTask: (interviewId: number, taskIndex: number) => Promise<boolean>;
  clearError: () => void;
}

export const useInterviews = (): UseInterviewsReturn => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState({
    fetch: false,
    create: false,
    update: false,
    delete: false,
  });

  const clearError = useCallback(() => setError(null), []);

  const fetchInterviews = useCallback(async (retryCount = 0) => {
    setOperationLoading(prev => ({ ...prev, fetch: true }));
    setLoading(true);
    setError(null);
    
    try {
      logInfo('Fetching interviews', { attempt: retryCount + 1 });
      const data = await apiClient.listInterviews();
      setInterviews(data);
      logInfo('Interviews fetched successfully', { count: data.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch interviews';
      
      if (retryCount < 2 && message.includes('network')) {
        logInfo('Retrying fetch interviews', { attempt: retryCount + 2 });
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchInterviews(retryCount + 1);
      }
      
      setError(message);
      logError('Failed to fetch interviews', err as Error);
    } finally {
      setLoading(false);
      setOperationLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  const addInterview = useCallback(
    async (interviewData: Omit<Interview, 'id' | 'created_at' | 'updated_at'>) => {
      setOperationLoading(prev => ({ ...prev, create: true }));
      setError(null);
      
      const optimisticInterview: Interview = {
        ...(interviewData as any),
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setInterviews(prev => [optimisticInterview, ...prev]);

      try {
        logInfo('Adding new interview', { date: interviewData.date });

        // FIXED: Proper type conversion for API
        const applicationId = (interviewData as any).applicationId ?? (interviewData as any).application_id;
        const prepChecklist = (interviewData as any).prep_checklist ?? (interviewData as any).prepChecklist ?? [];

        // Validate application_id
        if (!applicationId || applicationId === '' || isNaN(Number(applicationId))) {
          throw new Error('Application ID is required and must be a valid number');
        }

        const payload = {
          application_id: Number(applicationId), // Convert to number
          date: interviewData.date,
          time: (interviewData as any).time || '00:00',
          type: (interviewData as any).type ?? 'phone',
          interviewer: (interviewData as any).interviewer ?? null,
          location: (interviewData as any).location ?? null,
          notes: (interviewData as any).notes ?? null,
          prep_checklist: JSON.stringify(prepChecklist), // Convert to JSON string
          reminders: (interviewData as any).reminders ?? true,
        };

        logInfo('Payload being sent:', payload);

        const newInterview = await apiClient.createInterview(payload);
        
        setInterviews(prev => 
          prev.map(i => i.id === optimisticInterview.id ? newInterview : i)
        );
        
        logInfo('Interview added successfully', { id: newInterview.id });
        return newInterview;
      } catch (err) {
        setInterviews(prev => prev.filter(i => i.id !== optimisticInterview.id));
        
        const message = err instanceof Error ? err.message : 'Failed to add interview';
        setError(message);
        logError('Failed to add interview', err as Error);
        return null;
      } finally {
        setOperationLoading(prev => ({ ...prev, create: false }));
      }
    },
    []
  );

  const updateInterview = useCallback(
    async (id: number, updates: Partial<Interview>) => {
      setOperationLoading(prev => ({ ...prev, update: true }));
      setError(null);

      const original = interviews.find(i => i.id === id);
      if (!original) {
        setError('Interview not found');
        return null;
      }

      setInterviews(prev => 
        prev.map(i => i.id === id ? { ...i, ...updates } : i)
      );

      try {
        logInfo('Updating interview', { id });

        const body: any = { ...updates };
        
        // Handle prep_checklist conversion
        if (body.prepChecklist && !body.prep_checklist) {
          body.prep_checklist = JSON.stringify(body.prepChecklist);
          delete body.prepChecklist;
        } else if (body.prep_checklist && Array.isArray(body.prep_checklist)) {
          body.prep_checklist = JSON.stringify(body.prep_checklist);
        }

        // Handle application_id conversion
        if (body.applicationId) {
          body.application_id = Number(body.applicationId);
          delete body.applicationId;
        } else if (body.application_id) {
          body.application_id = Number(body.application_id);
        }

        const updated = await apiClient.updateInterview(id, body);
        
        setInterviews(prev => prev.map(i => (i.id === id ? updated : i)));
        
        logInfo('Interview updated successfully', { id });
        return updated;
      } catch (err) {
        setInterviews(prev => prev.map(i => (i.id === id ? original : i)));
        
        const message = err instanceof Error ? err.message : 'Failed to update interview';
        setError(message);
        logError('Failed to update interview', err as Error);
        return null;
      } finally {
        setOperationLoading(prev => ({ ...prev, update: false }));
      }
    },
    [interviews]
  );

  const deleteInterview = useCallback(
    async (id: number) => {
      setOperationLoading(prev => ({ ...prev, delete: true }));
      setError(null);

      const original = interviews.find(i => i.id === id);
      if (!original) {
        setError('Interview not found');
        return false;
      }

      setInterviews(prev => prev.filter(i => i.id !== id));

      try {
        logInfo('Deleting interview', { id });
        await apiClient.deleteInterview(id);
        logInfo('Interview deleted successfully', { id });
        return true;
      } catch (err) {
        setInterviews(prev => [...prev, original].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        
        const message = err instanceof Error ? err.message : 'Failed to delete interview';
        setError(message);
        logError('Failed to delete interview', err as Error);
        return false;
      } finally {
        setOperationLoading(prev => ({ ...prev, delete: false }));
      }
    },
    [interviews]
  );

  const togglePrepTask = useCallback(
    async (interviewId: number, taskIndex: number) => {
      const interview = interviews.find(i => i.id === interviewId);
      if (!interview) return false;

      // ✅ FIX: Properly parse prep_checklist if it's a JSON string
      const rawChecklist = (interview as any).prepChecklist || (interview as any).prep_checklist;
      let prepChecklist = [];

      if (typeof rawChecklist === 'string') {
        try {
          prepChecklist = JSON.parse(rawChecklist);
        } catch (e) {
          console.error('Failed to parse prep_checklist:', e);
          return false;
        }
      } else if (Array.isArray(rawChecklist)) {
        prepChecklist = [...rawChecklist];
      } else {
        return false;
      }

      // Check if taskIndex is valid
      if (!prepChecklist[taskIndex]) return false;

      // Toggle the completed status
      prepChecklist[taskIndex] = {
        ...prepChecklist[taskIndex],
        completed: !prepChecklist[taskIndex].completed,
      };

      // ✅ Send as array - the updateInterview hook will stringify it
      return !!(await updateInterview(interviewId, { 
        prep_checklist: prepChecklist 
      } as any));
    },
    [interviews, updateInterview]
  );

  return {
    interviews,
    loading,
    error,
    operationLoading,
    fetchInterviews,
    addInterview,
    updateInterview,
    deleteInterview,
    togglePrepTask,
    clearError,
  };
};