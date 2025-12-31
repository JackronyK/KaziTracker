// ============================================================================
// src/hooks/useOffers.ts
// ============================================================================

// src/hooks/useOffers.ts
import { useState, useCallback } from 'react';
import { logInfo, logError } from '../utils/errorLogger';
import { apiClient } from '../api';
import type { Offer } from '../types/Premium';

// 1. EXPORT THE INTERFACE AT TOP LEVEL FOR CONSUMER USAGE
export interface UseOffersReturn {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  operationLoading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  fetchOffers: () => Promise<void>;
  addOffer: (data: Partial<Offer>) => Promise<Offer | null>;
  updateOffer: (id: number, updates: Partial<Offer>) => Promise<Offer | null>;
  deleteOffer: (id: number) => Promise<boolean>;
  updateOfferStatus: (id: number, status: 'pending' | 'accepted' | 'rejected' | 'negotiating') => Promise<boolean>;
  addNegotiationEntry: (id: number, proposal: string) => Promise<boolean>;
  clearError: () => void;
}

// 2. OPTIMIZED HOOK IMPLEMENTATION WITH AUTO-FETCH
export const useOffers = (): UseOffersReturn => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState({
    fetch: false,
    create: false,
    update: false,
    delete: false,
  });

  const clearError = useCallback(() => setError(null), []);

  const fetchOffers = useCallback(async () => {
    setOperationLoading(prev => ({ ...prev, fetch: true }));
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
      setOperationLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  const addOffer = useCallback(async (offerData: Partial<Offer>) => {
    setOperationLoading(prev => ({ ...prev, create: true }));
    setError(null);

    const optimisticOffer: Offer = {
      ...(offerData as any),
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: offerData.status || 'pending',
    };

    setOffers(prev => [optimisticOffer, ...prev]);

    try {
      logInfo('Adding new offer');

      // FIXED: Proper type conversion for API
      const applicationId = (offerData as any).application_id ?? (offerData as any).applicationId;
      const negotiation_history = (offerData as any).negotiation_history ?? (offerData as any).negotiation_history ?? [];

      // Validate application_id
      if (!applicationId || applicationId === '' || isNaN(Number(applicationId))) {
        throw new Error('Application ID is required and must be a valid number');
      }

      const payload: any = {
        application_id: Number(applicationId), // Convert to number
        company_name: (offerData as any).company_name ?? (offerData as any).companyName,
        position: (offerData as any).position,
        salary: Number((offerData as any).salary || 0),
        benefits: JSON.stringify((offerData as any).benefits ?? []), // Convert to JSON string
        start_date: (offerData as any).start_date ?? (offerData as any).startDate,
        deadline: (offerData as any).deadline,
        status: (offerData as any).status ?? 'pending',
        negotiation_history: JSON.stringify(negotiation_history), // Convert to JSON string
      };

      logInfo('Offer payload:', payload);

      const created = await apiClient.createOffer(payload);
      
      setOffers(prev => 
        prev.map(o => o.id === optimisticOffer.id ? created : o)
      );
      
      logInfo('Offer added successfully', { id: created.id });
      return created;
    } catch (err) {
      setOffers(prev => prev.filter(o => o.id !== optimisticOffer.id));
      
      const message = err instanceof Error ? err.message : 'Failed to add offer';
      setError(message);
      logError('Failed to add offer', err as Error);
      return null;
    } finally {
      setOperationLoading(prev => ({ ...prev, create: false }));
    }
  }, []);

  const updateOffer = useCallback(async (id: number, updates: Partial<Offer>) => {
    setOperationLoading(prev => ({ ...prev, update: true }));
    setError(null);

    const original = offers.find(o => o.id === id);
    if (!original) {
      setError('Offer not found');
      return null;
    }

    setOffers(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));

    try {
      logInfo('Updating offer', { id });

      const body = { ...updates } as any;
      
      // Handle negotiation_history conversion
      if (body.negotiationHistory && !body.negotiation_history) {
        body.negotiation_history = JSON.stringify(body.negotiationHistory);
        delete body.negotiationHistory;
      } else if (body.negotiation_history && Array.isArray(body.negotiation_history)) {
        body.negotiation_history = JSON.stringify(body.negotiation_history);
      }

      // Handle benefits conversion
      if (body.benefits && Array.isArray(body.benefits)) {
        body.benefits = JSON.stringify(body.benefits);
      }

      // Handle date fields
      if (body.startDate && !body.start_date) {
        body.start_date = body.startDate;
        delete body.startDate;
      }

      // Handle application_id
      if (body.applicationId) {
        body.application_id = Number(body.applicationId);
        delete body.applicationId;
      } else if (body.application_id) {
        body.application_id = Number(body.application_id);
      }

      const updated = await apiClient.updateOffer(id, body);
      setOffers(prev => prev.map(o => (o.id === id ? updated : o)));
      logInfo('Offer updated successfully', { id });
      return updated;
    } catch (err) {
      setOffers(prev => prev.map(o => (o.id === id ? original : o)));
      
      const message = err instanceof Error ? err.message : 'Failed to update offer';
      setError(message);
      logError('Failed to update offer', err as Error);
      return null;
    } finally {
      setOperationLoading(prev => ({ ...prev, update: false }));
    }
  }, [offers]);

  const deleteOffer = useCallback(async (id: number) => {
    setOperationLoading(prev => ({ ...prev, delete: true }));
    setError(null);

    const original = offers.find(o => o.id === id);
    if (!original) {
      setError('Offer not found');
      return false;
    }

    setOffers(prev => prev.filter(o => o.id !== id));

    try {
      logInfo('Deleting offer', { id });
      await apiClient.deleteOffer(id);
      logInfo('Offer deleted successfully', { id });
      return true;
    } catch (err) {
      setOffers(prev => [...prev, original].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      
      const message = err instanceof Error ? err.message : 'Failed to delete offer';
      setError(message);
      logError('Failed to delete offer', err as Error);
      return false;
    } finally {
      setOperationLoading(prev => ({ ...prev, delete: false }));
    }
  }, [offers]);

  const updateOfferStatus = useCallback(
    async (id: number, status: 'pending' | 'accepted' | 'rejected' | 'negotiating') => {
      return !!(await updateOffer(id, { status }));
    },
    [updateOffer]
  );

  const addNegotiationEntry = useCallback(
    async (id: number, proposal: string) => {
      const offer = offers.find(o => o.id === id);
      if (!offer) return false;

      const history = [
        ...((offer as any).negotiationHistory || (offer as any).negotiation_history || []),
        {
          date: new Date().toISOString(),
          proposal,
        },
      ];

      return !!(await updateOffer(id, { 
        negotiation_history: history 
      } as any));
    },
    [offers, updateOffer]
  );

  return {
    offers,
    loading,
    error,
    operationLoading,
    fetchOffers,
    addOffer,
    updateOffer,
    deleteOffer,
    updateOfferStatus,
    addNegotiationEntry,
    clearError,
  };
};