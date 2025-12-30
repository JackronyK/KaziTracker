

// src/components/Auth/ProtectedRoute.tsx
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
 // const [ setUser] = useState<User | null>(null); // ✅ Fixed: [value, setter]
  //const navigate = useNavigate(); // Optional

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = apiClient.getToken();
        
        if (!token) {
          logError('No authentication token found');
          setIsAuthenticated(false);
         // setUser(null);
          onAuthCheck?.(null);
          return;
        }

        const currentUser = await apiClient.getCurrentUser();
        
        if (currentUser) {
          logInfo('User authenticated', { email: currentUser.email });
          setIsAuthenticated(true);
          //setUser(currentUser);
          onAuthCheck?.(currentUser);
        } else {
          logError('User fetch returned null');
          setIsAuthenticated(false);
          //setUser(null);
          onAuthCheck?.(null);
        }
      } catch (error) {
        logError('Authentication check failed', error);
        setIsAuthenticated(false);
        //setUser(null);
        onAuthCheck?.(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [onAuthCheck]);

  // Optional: Redirect to login if not authenticated
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     navigate('/login');
  //   }
  // }, [isLoading, isAuthenticated, navigate]);

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

  if (!isAuthenticated) {
    apiClient.clearToken();
    // In a real app, you'd redirect using useNavigate or return <Navigate to="/login" />
    return null; // or <Navigate to="/login" replace />
  }

  return <>{children}</>;
};

export default ProtectedRoute;

