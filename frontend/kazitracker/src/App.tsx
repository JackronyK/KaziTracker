// Main App 
// src/App.tsx

/**
 * Main App Component 
 * Updated with proper routing and layout
 */

import { useState, useEffect } from 'react';
import type { User } from './types';
import { apiClient } from './api/index';
import { logError, logInfo } from './utils/errorLogger';

// Components
import { LoginPage } from './components/Auth/LoginPage';
import { MainLayout } from './components/Layout/MainLayout';
import { DashboardPage } from './pages/Dashboard';
import { JobsPage } from './pages/JobsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ResumesPage } from './pages/ResumePage';
import { PremiumHub } from './pages/PremiumHub';
import type { NavTab } from './components/Layout/Sidebar';


/**
 * Main App Component
 * 
 * Structure:
 * - Checks authentication status
 * - Shows LoginPage if not authenticated
 * - Shows MainLayout with content if authenticated
 * - Handles logout and navigation
 * - Listens to navigation events from components
 */

export default function App() {
  // State
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
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
  // NAVIGATION EVENT LISTENER - THIS IS THE KEY FIX!
  // =========================================================================

  useEffect(() => {
    // Listen for navigation events from useNavigation hook and other components
    const handleNavigationEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ tab: NavTab }>;
      const { tab } = customEvent.detail;
      
      if (tab && tab !== activeTab) {
        logInfo('Navigation event received in App.tsx', { tab });
        setActiveTab(tab);
        
        // Update sessionStorage to keep in sync
        sessionStorage.setItem('activeTab', tab);
        
        // Update URL hash
        window.location.hash = tab;
      }
    };

    // Add event listener
    window.addEventListener('navigate', handleNavigationEvent);

    // Cleanup
    return () => {
      window.removeEventListener('navigate', handleNavigationEvent);
    };
  }, [activeTab]);

  // =========================================================================
  // INITIALIZE ACTIVE TAB FROM STORAGE/HASH ON MOUNT
  // =========================================================================

  useEffect(() => {
    // Check sessionStorage first
    const storedTab = sessionStorage.getItem('activeTab') as NavTab;
    if (storedTab) {
      setActiveTab(storedTab);
      return;
    }

    // Check URL hash
    const hash = window.location.hash.replace('#', '') as NavTab;
    if (hash) {
      setActiveTab(hash);
      sessionStorage.setItem('activeTab', hash);
    }
  }, []);

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  /**
   * Handle successful login
   */
  const handleLoginSuccess = (token: string) => {
    logInfo('Login successful');
    apiClient.setToken(token);
    setIsAuthenticated(true);

    // Fetch user data
    apiClient
      .getCurrentUser()
      .then((userData) => {
        setUser(userData);
        
        // Check if profile is complete
        if (!userData.full_name) {
          setShowProfileSetup(true);
        } else {
          setShowProfileSetup(false);
        }
      })
      .catch((error) => {
        logError('Failed to fetch user data', error);
      });
  };

  const handleProfileComplete = () => {
    logInfo('Profile setup complete');
    setShowProfileSetup(false);
    
    // Refresh user data
    apiClient
      .getProfile()
      .then((userData) => {
        setUser(userData);
      })
      .catch((error) => {
        logError('Failed to fetch updated profile', error);
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
    
    // Clear session storage
    sessionStorage.removeItem('activeTab');
    sessionStorage.removeItem('previousTab');
  };

  /**
   * Handle navigation change from MainLayout
   */
  const handleNavChange = (tab: NavTab) => {
    logInfo('Navigation change from MainLayout', { tab });
    
    // Store previous tab
    sessionStorage.setItem('previousTab', activeTab);
    
    // Update active tab
    setActiveTab(tab);
    sessionStorage.setItem('activeTab', tab);
    
    // Update URL hash
    window.location.hash = tab;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // =========================================================================
  // RENDER: AUTHENTICATED BUT PROFILE INCOMPLETE
  // =========================================================================

  if (showProfileSetup) {
    return <ProfilePage user={user} onComplete={handleProfileComplete} />;
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
      {activeTab === 'dashboard' && (
        <DashboardPage 
          activeTab={activeTab}
          onNavigate={handleNavChange}
        />
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && <JobsPage />}

      {/* Applications Tab */}
      {activeTab === 'applications' && <ApplicationsPage />}

      {/* Resumes Tab */}
      {activeTab === 'resumes' && <ResumesPage />}

      {/* Premium Hub */}
      {activeTab === 'premium' && (
        <PremiumHub onNavigateToDashboard={() => handleNavChange('dashboard')} />
      )}
    </MainLayout>
  );
}