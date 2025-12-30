// src/hooks/useNavigation.ts

/**
 * ============================================================================
 * useNavigation Hook
 * ============================================================================
 * Manages navigation state and operations
 * Works with existing App.tsx navigation system
 */

import { useState, useCallback, useEffect } from 'react';
import type { NavTab, UseNavigationReturn } from '../types';
import { logInfo } from '../utils/errorLogger';

/**
 * Hook to manage navigation between tabs
 * 
 * Features:
 * - Navigate to any tab
 * - Track current active tab
 * - Go back to previous tab
 * - Integration with custom events
 * - Session storage persistence
 * 
 * Usage:
 * ```typescript
 * const { navigateTo, activeTab, goBack } = useNavigation();
 * 
 * // Navigate to a tab
 * navigateTo('applications');
 * 
 * // Go back to previous tab
 * goBack();
 * ```
 */
export const useNavigation = (): UseNavigationReturn => {
  const [activeTab, setActiveTab] = useState<NavTab | null>(() => {
    // Initialize from sessionStorage or default to dashboard
    try {
      const stored = sessionStorage.getItem('activeTab');
      return (stored as NavTab) || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [loading, setLoading] = useState(false);

  /**
   * Navigate to a specific tab
   */
  const navigateTo = useCallback((tab: NavTab) => {
    setLoading(true);
    logInfo('Navigation initiated', { from: activeTab, to: tab });

    try {
      // Store previous tab for back navigation
      if (activeTab) {
        sessionStorage.setItem('previousTab', activeTab);
      }

      // Update current tab
      setActiveTab(tab);
      sessionStorage.setItem('activeTab', tab);

      // Dispatch custom event for App.tsx to listen to
      window.dispatchEvent(
        new CustomEvent('navigate', {
          detail: { tab },
        })
      );

      // Update URL hash (optional - for browser back/forward support)
      if (typeof window !== 'undefined') {
        window.location.hash = tab;
      }

      // Scroll to top on navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });

      logInfo('Navigation completed', { tab });
    } catch (err) {
      logInfo('Navigation failed', { tab, error: err });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  /**
   * Go back to previous tab
   */
  const goBack = useCallback(() => {
    try {
      const previousTab = sessionStorage.getItem('previousTab') as NavTab;
      if (previousTab) {
        logInfo('Navigating back', { to: previousTab });
        navigateTo(previousTab);
      } else {
        logInfo('No previous tab - navigating to dashboard');
        navigateTo('dashboard');
      }
    } catch (err) {
      logInfo('Go back failed - navigating to dashboard');
      navigateTo('dashboard');
    }
  }, [navigateTo]);

  /**
   * Get current active tab
   */
  const getCurrentTab = useCallback((): NavTab | null => {
    try {
      // Try sessionStorage first
      const stored = sessionStorage.getItem('activeTab');
      if (stored) {
        return stored as NavTab;
      }

      // Try URL hash
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        return hash as NavTab;
      }

      // Return state
      return activeTab;
    } catch {
      return activeTab;
    }
  }, [activeTab]);

  /**
   * Check if a tab is currently active
   */
  const isTabActive = useCallback(
    (tab: NavTab): boolean => {
      return activeTab === tab;
    },
    [activeTab]
  );

  /**
   * Listen for custom navigation events from other components
   */
  useEffect(() => {
    const handleNavigationEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ tab: NavTab }>;
      const { tab } = customEvent.detail;
      
      if (tab && tab !== activeTab) {
        logInfo('Navigation event received', { tab });
        setActiveTab(tab);
      }
    };

    window.addEventListener('navigate', handleNavigationEvent);

    return () => {
      window.removeEventListener('navigate', handleNavigationEvent);
    };
  }, [activeTab]);

  /**
   * Sync with URL hash changes (browser back/forward buttons)
   */
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavTab;
      if (hash && hash !== activeTab) {
        logInfo('URL hash changed', { hash });
        setActiveTab(hash);
        sessionStorage.setItem('activeTab', hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [activeTab]);

  return {
    activeTab,
    loading,
    navigateTo,
    goBack,
    getCurrentTab,
    isTabActive,
  };
};