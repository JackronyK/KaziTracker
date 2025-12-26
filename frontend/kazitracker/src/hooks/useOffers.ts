// src/hooks/useOffers.ts
import { useState, useCallback } from 'react';
import { logInfo, logError } from '../utils/errorLogger';
import type { Offer } from '../types/Premium';
import { apiClient } from '../api';

export const useOffers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Fetching offers');
      const data = await apiClient.listOffers();
      setOffers(data);
      logInfo('Offers fetched successfully', { count: data.length });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch offers';
      setError(message);
      logError('Failed to fetch offers', err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addOffer = useCallback(async (offerData: Partial<Offer>) => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Adding new offer', {
        companyName: (offerData as any).company_name ?? (offerData as any).companyName,
        applicationId: (offerData as any).application_id ?? (offerData as any).applicationId,
      });

      // normalize payload for backend
      const payload: any = {
        application_id: (offerData as any).application_id ?? (offerData as any).applicationId,
        company_name: (offerData as any).company_name ?? (offerData as any).companyName,
        position: (offerData as any).position,
        salary: (offerData as any).salary,
        benefits: (offerData as any).benefits ?? null,
        start_date: (offerData as any).start_date ?? (offerData as any).startDate,
        deadline: (offerData as any).deadline,
        status: (offerData as any).status ?? 'pending',
        negotiation_history: (offerData as any).negotiation_history ?? (offerData as any).negotiationHistory ?? null,
      };

      const created = await apiClient.createOffer(payload);
      setOffers(prev => [...prev, created]);
      logInfo('Offer added successfully', { id: created.id });
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      logError('Failed to add offer', err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOffer = useCallback(async (id: number, updates: Partial<Offer>) => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Updating offer', { id });

      const body = { ...updates } as any;
      // convert camelCase to snake_case fields if necessary
      if (body.negotiationHistory && !body.negotiation_history) {
        body.negotiation_history = body.negotiationHistory;
        delete body.negotiationHistory;
      }
      if (body.startDate && !body.start_date) {
        body.start_date = body.startDate;
        delete body.startDate;
      }

      const updated = await apiClient.updateOffer(id, body);
      setOffers(prev => prev.map(o => (o.id === id ? updated : o)));
      logInfo('Offer updated successfully', { id });
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      logError('Failed to update offer', err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOffer = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Deleting offer', { id });
      await apiClient.deleteOffer(id);
      setOffers(prev => prev.filter(o => o.id !== id));
      logInfo('Offer deleted successfully', { id });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      logError('Failed to delete offer', err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    offers,
    loading,
    error,
    fetchOffers,
    addOffer,
    updateOffer,
    deleteOffer,
  };
};
