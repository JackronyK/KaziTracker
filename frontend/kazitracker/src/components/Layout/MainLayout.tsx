// src/components/Layout/MainLayout.tsx

/**
 * Enhanced MainLayout Component - FIXED
 * Properly applies dark mode to entire application
 */

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
  // Optional: Pass hook data for notifications
  deadlines?: any[];
  interviews?: any[];
  offers?: any[];
}

/**
 * Enhanced MainLayout Component
 * 
 * Features:
 * ✅ Global dark mode (affects entire page including content)
 * ✅ Theme persistence
 * ✅ System preference detection
 * ✅ Smooth theme transitions
 * ✅ Responsive layout
 * ✅ Mobile sidebar drawer
 * ✅ Dark mode CSS applied globally
 * 
 * The key difference: We apply dark mode to the root element
 * so it affects ALL children, not just header/sidebar
 */
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
    
    // Determine initial theme
    let shouldBeDark = false;
    if (savedTheme === 'dark') {
      shouldBeDark = true;
    } else if (savedTheme === 'light') {
      shouldBeDark = false;
    } else {
      // Auto mode - follow system preference
      shouldBeDark = prefersDark;
    }
    
    setIsDarkMode(shouldBeDark);
  }, []);

  // Update document root and localStorage when theme changes
  useEffect(() => {
    if (!isMounted) return;

    if (isDarkMode) {
      // Add dark mode class to entire document
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      document.body.style.backgroundColor = 'rgb(3, 7, 18)';
      document.body.style.color = 'rgb(229, 231, 235)';
      localStorage.setItem('theme-mode', 'dark');
    } else {
      // Remove dark mode class from entire document
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      document.body.style.backgroundColor = 'rgb(249, 250, 251)';
      document.body.style.color = 'rgb(17, 24, 39)';
      localStorage.setItem('theme-mode', 'light');
    }

    logInfo('Theme changed', { isDarkMode });
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
    <div className={`flex flex-col h-screen transition-all duration-200 ${
      isDarkMode
        ? 'bg-gray-950 text-gray-100'
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header - Receives theme props */}
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

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Receives theme props */}
        <Sidebar
          activeTab={currentTab}
          onTabChange={handleNavChange}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          isDarkMode={isDarkMode}
        />

        {/* Main Content - Theme automatically applied through CSS */}
        <main className={`
          flex-1 overflow-y-auto transition-colors duration-200
          ${isDarkMode
            ? 'bg-gray-950 text-gray-100'
            : 'bg-gray-50 text-gray-900'
          }
        `}>
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Theme CSS */}
      <style>{`
        /* Dark mode root styles */
        .dark,
        .dark * {
          color-scheme: dark;
        }

        /* Light mode root styles */
        :root:not(.dark) {
          color-scheme: light;
        }

        /* Smooth transitions for all theme-aware elements */
        * {
          @apply transition-colors duration-200;
        }

        /* Dark mode specific styles */
        .dark {
          --tw-bg-opacity: 1;
          --tw-text-opacity: 1;
        }

        /* Ensure modals and dropdowns respect theme */
        .dark input,
        .dark textarea,
        .dark select,
        .dark button {
          color-scheme: dark;
        }

        /* Override Tailwind dark mode for better control */
        .dark {
          background-color: rgb(3, 7, 18); /* gray-950 */
          color: rgb(229, 231, 235); /* gray-100 */
        }

        .dark input:not([type="checkbox"]):not([type="radio"]),
        .dark textarea {
          background-color: rgb(17, 24, 39); /* gray-900 */
          border-color: rgb(31, 41, 55); /* gray-800 */
          color: rgb(229, 231, 235); /* gray-100 */
        }

        .dark input::placeholder {
          color: rgb(107, 114, 128); /* gray-500 */
        }

        /* Ensure all text inputs are readable in dark mode */
        .dark input[type="text"],
        .dark input[type="email"],
        .dark input[type="password"],
        .dark input[type="tel"],
        .dark input[type="number"],
        .dark textarea {
          background-color: rgb(31, 41, 55); /* gray-800 */
          color: rgb(243, 244, 246); /* gray-100 */
        }

        /* Dark mode form elements */
        .dark select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23d1d5db' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
        }

        /* Scrollbar styling */
        .dark ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .dark ::-webkit-scrollbar-track {
          background: rgb(17, 24, 39); /* gray-900 */
        }

        .dark ::-webkit-scrollbar-thumb {
          background: rgb(55, 65, 81); /* gray-700 */
          border-radius: 4px;
        }

        .dark ::-webkit-scrollbar-thumb:hover {
          background: rgb(75, 85, 99); /* gray-600 */
        }

        /* Light mode scrollbar */
        :root:not(.dark) ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        :root:not(.dark) ::-webkit-scrollbar-track {
          background: rgb(249, 250, 251); /* gray-50 */
        }

        :root:not(.dark) ::-webkit-scrollbar-thumb {
          background: rgb(209, 213, 219); /* gray-300 */
          border-radius: 4px;
        }

        :root:not(.dark) ::-webkit-scrollbar-thumb:hover {
          background: rgb(156, 163, 175); /* gray-400 */
        }

        /* Ensure backdrop remains visible in dark mode */
        .dark .bg-black\\/50 {
          background-color: rgba(0, 0, 0, 0.5);
        }

        /* Smooth transitions */
        @media (prefers-reduced-motion: no-preference) {
          * {
            transition-property: background-color, border-color, color, fill, stroke;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 200ms;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;