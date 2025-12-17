//src/components/Layout/MainLayout.tsx
/**
 * MainLayout Component
 * Wrapper for authenticated pages with header, sidebar, and main content
 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../types';
import { Header } from './Header';
import { Sidebar} from './Sidebar';
import type { NavTab } from './Sidebar';
import { logInfo } from '../../utils/errorLogger';

interface MainLayoutProps {
  user: User | null;
  children: ReactNode;
  onLogout: () => void;
  onNavChange?: (tab: NavTab) => void;
  activeTab?: NavTab;
}

/**
 * MainLayout Component
 * 
 * Combines Header + Sidebar + Main Content Area
 * Handles mobile menu state
 * 
 * Features:
 * - Responsive layout (mobile & desktop)
 * - Header with user menu
 * - Sidebar navigation
 * - Main content area
 * - Mobile-friendly menu toggle
 * 
 * Usage:
 * <MainLayout user={user} onLogout={logout} activeTab={activeTab} onNavChange={setTab}>
 *   <Dashboard />
 * </MainLayout>
 */
export const MainLayout = ({
  user,
  children,
  onLogout,
  onNavChange,
  activeTab = 'dashboard',
}: MainLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTab>(activeTab);

  const handleNavChange = (tab: NavTab) => {
    setCurrentTab(tab);
    onNavChange?.(tab);
    logInfo('Navigation changed', { tab });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Header
        user={user}
        onLogout={onLogout}
        onMenuToggle={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={currentTab}
          onTabChange={handleNavChange}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Content Wrapper with Padding */}
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;