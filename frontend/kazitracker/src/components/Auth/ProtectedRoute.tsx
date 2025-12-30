// src/components/auth/ProtectedRoute.tsx
/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Redirects to login if user is not authenticated
 */

import type { ReactNode } from "react";
import type { User } from '../../types';
import { apiClient } from '../../api/index';
import { logError, logInfo } from '../../utils/errorLogger';
import { useState, useEffect } from 'react';



interface ProtectedRouteProps {
  children: ReactNode;
  onAuthCheck?: (user: User | null) => void;
}

/**
 * ProtectedRoute Component
 * 
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
export const ProtectedRoute = ({ children, onAuthCheck }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists
        const token = apiClient.getToken();
        
        if (!token) {
          logError('No authentication token found');
          setIsAuthenticated(false);
          setUser(null);
          onAuthCheck?.(null);
          return;
        }

        // Verify token is still valid by fetching user
        const currentUser = await apiClient.getCurrentUser();
        
        if (currentUser) {
          logInfo('User authenticated', { email: currentUser.email });
          setIsAuthenticated(true);
          setUser(currentUser);
          onAuthCheck?.(currentUser);
        } else {
          logError('User fetch returned null');
          setIsAuthenticated(false);
          setUser(null);
          onAuthCheck?.(null);
        }
      } catch (error) {
        logError('Authentication check failed');
        setIsAuthenticated(false);
        setUser(null);
        onAuthCheck?.(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [onAuthCheck]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    // Remove the token if it's invalid
    apiClient.clearToken();
    
    // Note: In a real app, you'd use React Router's Navigate component
    // For now, we'll handle this in the main App.tsx
    return null;
  }

  // Authenticated - render children
  return <>{children}</>;
};

export default ProtectedRoute;