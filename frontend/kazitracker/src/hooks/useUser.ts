// src/hooks/useUser.ts

/**
 * ============================================================================
 * useUser Hook
 * ============================================================================
 * Manages all user-related operations and state
 * Follows the same pattern as useJobs for consistency
 */

import { useState, useCallback, useEffect } from 'react';
import type { User, ProfileUpdateRequest, UseUserReturn } from '../types';
import { apiClient } from '../api/index';
import { logError, logInfo } from '../utils/errorLogger';

export const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current user from API
   */
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Fetching current user');
      const data = await apiClient.getCurrentUser();
      setUser(data);
      logInfo('User fetched successfully', { email: data.email });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user';
      setError(message);
      logError('Failed to fetch user', err as Error);
      
      // If 401, user is not authenticated
      if (message.includes('401')) {
        setUser(null);
        apiClient.clearToken();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (profile: ProfileUpdateRequest): Promise<User | null> => {
      setLoading(true);
      setError(null);
      try {
        logInfo('Updating user profile', { 
          full_name: profile.full_name,
          hasPhone: !!profile.phone_number,
          hasLocation: !!profile.location,
        });
        
        const updated = await apiClient.updateProfile(profile);
        
        // Update local state
        setUser(updated);
        logInfo('User profile updated successfully');
        
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update profile';
        setError(message);
        logError('Failed to update user profile', err as Error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Refresh user data (fetch profile)
   */
  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logInfo('Refreshing user profile');
      const data = await apiClient.getProfile();
      setUser(data);
      logInfo('User profile refreshed successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh user';
      setError(message);
      logError('Failed to refresh user', err as Error);
      
      // If 401, user is not authenticated
      if (message.includes('401')) {
        setUser(null);
        apiClient.clearToken();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    logInfo('User logout initiated');
    apiClient.clearToken();
    setUser(null);
    setError(null);
    logInfo('User logged out successfully');
  }, []);

  /**
   * Auto-fetch user on mount if token exists
   */
  useEffect(() => {
    const token = apiClient.getToken();
    if (token && !user) {
      logInfo('Token found - auto-fetching user');
      fetchUser();
    }
  }, [fetchUser, user]);

  return {
    user,
    loading,
    error,
    fetchUser,
    updateProfile,
    refreshUser,
    logout,
  };
};