// ============================================================================
// src/hooks/useToast.ts
// ============================================================================

import { useState, useCallback } from 'react';
export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const success = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('success', title, message, duration);
  }, [showToast]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('error', title, message, duration);
  }, [showToast]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('warning', title, message, duration);
  }, [showToast]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('info', title, message, duration);
  }, [showToast]);

  const closeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const closeAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    closeToast,
    closeAll,
  };
};