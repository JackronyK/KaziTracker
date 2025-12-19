// Main App 
// src/App.tsx

/**
 * Main App Component - Phase 2
 * Updated with proper routing and layout
 */

import { useState, useEffect } from 'react';
import type { User } from './types';
import { apiClient } from './api';
import { logError, logInfo } from './utils/errorLogger';

// Components
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import { LoginPage } from './components/Auth/LoginPage';
import { MainLayout } from './components/Layout/MainLayout';
import { DashboardPage } from './pages/Dashboard';
import { JobsPage } from './pages/JobsPage'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { ResumesPage } from './pages/ResumePage'
import { Sidebar } from './components/Layout/Sidebar';
import type { NavTab } from './components/Layout/Sidebar';
import { UserStar } from 'lucide-react';

/**
 * Main App Component
 * 
 * Structure:
 * - Checks authentication status
 * - Shows LoginPage if not authenticated
 * - Shows MainLayout with content if authenticated
 * - Handles logout and navigation
 */

export default function App() {
  // State
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // =========================================================================
  // AUTHENTICATION CHECK
  // =========================================================================

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = apiClient.getToken();

        if (!token) {
          logInfo('No aunthentication token found');
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        logInfo('Verifying aunthentication token');
        const currentUser = await apiClient.getCurrentUser();

        if (currentUser) {
          logInfo('Use authenticated', {email: currentUser.email });
          setIsAuthenticated(true);
          setUser(currentUser);
        } else {
          logInfo('User verification failed');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        logError('Aunthentication check failed', error as Error);
        setIsAuthenticated(false);
        setUser(null);        
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

    // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  /**
   * Handle successful login
   */
  const handleLogSuccess = (token: string) => {
    logInfo('Login Successful');
    apiClient.setToken(token);
    setIsAuthenticated(true);

    // Fetch user info after login
    apiClient
      .getCurrentUser()
      .then((userData) => {
        setUser(userData);
        logInfo('User data loaded', { email: userData.email });
      })
      .catch((error) => {
        logError('Failed to  fetch user data after login', error as Error);
      });
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logInfo('Logout initiated');
    apiClient.clearToken();
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('dashboard');
  };
  /**
   * Handle navigation change
   */
  const handleNavChange = (tab: NavTab) => {
    setActiveTab(tab);
    logInfo('Navigation changed', { tab });
  };
  // =========================================================================
  // RENDER: LOADING STATE
  // =========================================================================

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600 text-lg font-medium'>Loading KaziTracker...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: NOT AUTHENTICATED - SHOW LOGIN
  // =========================================================================

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLogSuccess}/>;
  }
  // =========================================================================
  // RENDER: AUTHENTICATED - SHOW MAIN LAYOUT + CONTENT
  // =========================================================================

  return (
    <MainLayout
      user={user}
      onLogout={handleLogout}
      activeTab={activeTab}
      onNavChange={handleNavChange}
      >
        {/* Page Content Based on Active Tab */}
        {activeTab === 'dashboard' && <DashboardPage activeTab={activeTab} />}

        {/* Jobs Tab - Phase 3 */}
        {activeTab === 'jobs' && <JobsPage /> }

        {/* Applications Tab - Phase 4 */}
        {activeTab == 'applications' && <ApplicationsPage />}

        {/* Resumes Tab - Phase 5 (Placeholder for now) */}
        {activeTab === 'resumes' && <ResumesPage/>}

        </MainLayout>
  );
}