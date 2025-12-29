// src/components/Layout/MainLayout.tsx
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { NavTab } from './Sidebar';
import { logInfo } from '../../utils/errorLogger';

interface MainLayoutProps {
  user: User | null;
  children: ReactNode;
  onLogout: () => void;
  onNavChange?: (tab: NavTab) => void;
  activeTab?: NavTab;
  deadlines?: any[];
  interviews?: any[];
  offers?: any[];
}

export const MainLayout = ({
  user,
  children,
  onLogout,
  onNavChange,
  activeTab = 'dashboard',
  deadlines = [],
  interviews = [],
  offers = [],
}: MainLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavTab>(activeTab);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem('theme-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let shouldBeDark = false;
    if (savedTheme === 'dark') {
      shouldBeDark = true;
    } else if (savedTheme === 'light') {
      shouldBeDark = false;
    } else {
      shouldBeDark = prefersDark;
    }
    
    setIsDarkMode(shouldBeDark);
  }, []);

  // Update document root and localStorage when theme changes
  useEffect(() => {
    if (!isMounted) return;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('theme-mode', 'dark');
      
      logInfo('Dark mode applied', { 
        hasDarkClass: document.documentElement.classList.contains('dark'),
        classes: document.documentElement.className 
      });
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('theme-mode', 'light');
      
      logInfo('Light mode applied', { 
        hasDarkClass: document.documentElement.classList.contains('dark'),
        classes: document.documentElement.className 
      });
    }
  }, [isDarkMode, isMounted]);

  const handleNavChange = (tab: NavTab) => {
    setCurrentTab(tab);
    onNavChange?.(tab);
    logInfo('Navigation changed', { tab });
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 transition-colors duration-300">
      {/* Header */}
      <Header
        user={user}
        onLogout={onLogout}
        onMenuToggle={setMobileMenuOpen}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        deadlines={deadlines}
        interviews={interviews}
        offers={offers}
      />

      {/* Main Content Area - Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Sidebar - Now properly positioned */}
        <Sidebar
          activeTab={currentTab}
          onTabChange={handleNavChange}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          isDarkMode={isDarkMode}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 transition-colors duration-300">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Theme Styles */}
      <style>{`
        /* Modern dark mode with gradient background */
        html.dark {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          color: #f1f5f9;
        }

        html.dark body,
        html.dark main {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
          color: #f1f5f9;
        }

        /* Dark mode form elements */
        .dark input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="reset"]),
        .dark textarea,
        .dark select {
          background-color: #0f172a;
          border-color: #475569;
          color: #f1f5f9;
        }

        .dark input::placeholder {
          color: #64748b;
        }

        .dark input:focus:not([type="checkbox"]):not([type="radio"]),
        .dark textarea:focus,
        .dark select:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        /* Dark mode cards with gradient */
        .dark .rounded-lg {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border-color: rgba(148, 163, 184, 0.3);
        }

        /* Scrollbar */
        .dark ::-webkit-scrollbar {
          width: 8px;
        }

        .dark ::-webkit-scrollbar-track {
          background: #0f172a;
        }

        .dark ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        /* Light mode scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f9fafb;
        }

        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        /* Smooth transitions */
        @media (prefers-reduced-motion: no-preference) {
          * {
            transition-property: background-color, border-color, color;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 300ms;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;