// src/components/Layout/Header.tsx

/**
 * Header Component - ENHANCED
 * Top navigation bar with fully functional user menu
 * Includes Profile, Settings, Help, and Theme Toggle
 */

import { LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import type { User } from '../../types';
import { logInfo } from '../../utils/errorLogger';
import { ProfileModal } from './ProfileModal';
import { SettingsModal } from './SettingsModal';
import { HelpModal } from './HelpModal';
import { NotificationsDropdown } from './NotificationsDropdown';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onMenuToggle?: (isOpen: boolean) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  deadlines?: any[];
  interviews?: any[];
  offers?: any[];
}

/**
 * Header Component
 * 
 * Features:
 * ✅ User info display
 * ✅ Functional Profile modal
 * ✅ Functional Settings modal (with theme toggle)
 * ✅ Functional Help & Support modal
 * ✅ Logout button
 * ✅ Notifications icon with badge
 * ✅ Dark/Light mode toggle
 * ✅ Mobile menu toggle
 * ✅ Responsive design
 * 
 * Usage:
 * <Header 
 *   user={user} 
 *   onLogout={handleLogout}
 *   isDarkMode={isDark}
 *   onThemeToggle={toggleTheme}
 * />
 */
export const Header = ({ 
  user, 
  onLogout, 
  onMenuToggle,
  isDarkMode = false,
  onThemeToggle = () => {},
  deadlines = [],
  interviews = [],
  offers = []
}: HeaderProps) => {
  // =========================================================================
  // STATE
  // =========================================================================

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleMenuToggle = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    onMenuToggle?.(newState);
    logInfo('Mobile menu toggled', { isOpen: newState });
  };

  const handleProfileClick = () => {
    logInfo('Profile modal opened');
    setShowUserMenu(false);
    setShowProfileModal(true);
  };

  const handleSettingsClick = () => {
    logInfo('Settings modal opened');
    setShowUserMenu(false);
    setShowSettingsModal(true);
  };

  const handleHelpClick = () => {
    logInfo('Help modal opened');
    setShowUserMenu(false);
    setShowHelpModal(true);
  };

  const handleLogout = () => {
    logInfo('Logout clicked');
    setShowUserMenu(false);
    onLogout();
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <>
      <header className={`sticky top-0 z-40 transition-colors ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-800 shadow-xl' 
          : 'bg-white border-gray-200 shadow-sm'
      } shadow-sm border-b`}>
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          
          {/* ============================================================= */}
          {/* ****LEFT SECTION: Logo & Title   *****/}
          {/* ============================================================= */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={handleMenuToggle}
              className={`lg:hidden p-2 rounded-lg transition ${
                isDarkMode
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* Logo & Title */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg hidden sm:block">
                <span className="text-white font-bold text-lg">💼</span>
              </div>
              <div>
                <h1 className={`text-xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  KaziTracker
                </h1>
                <p className={`text-xs hidden sm:block transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Job Application Manager
                </p>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* RIGHT SECTION: Actions & User Menu                           */}
          {/* ============================================================= */}
          <div className="flex items-center gap-4">
            {/* Notifications Dropdown - Now Functional! */}
            <NotificationsDropdown
              deadlines={deadlines}
              interviews={interviews}
              offers={offers}
              isDarkMode={isDarkMode}
            />

            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className={`p-2 rounded-lg transition ${
                isDarkMode
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Divider */}
            <div className={`w-px h-8 transition-colors ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>

            {/* User Menu */}
            <div className="relative">
              {/* User Button */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 p-2 rounded-lg transition ${
                  isDarkMode
                    ? 'hover:bg-gray-800 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                title="User menu"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>

                {/* User Info (Desktop) */}
                <div className="hidden sm:block text-left">
                  <p className={`text-sm font-medium transition-colors ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className={`text-xs transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  } truncate max-w-[150px]`}>
                    {user?.email || ''}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-1 z-50 transition-colors ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}>
                  
                  {/* User Info (Mobile) */}
                  <div className={`sm:hidden px-4 py-2 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <p className={`text-sm font-medium transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user?.email || 'User'}
                    </p>
                    <p className={`text-xs mt-1 transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Account
                    </p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleProfileClick}
                    className={`w-full text-left px-4 py-2 text-sm transition ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    👤 Profile
                  </button>

                  <button
                    onClick={handleSettingsClick}
                    className={`w-full text-left px-4 py-2 text-sm transition ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    ⚙️ Settings
                  </button>

                  <button
                    onClick={handleHelpClick}
                    className={`w-full text-left px-4 py-2 text-sm transition ${
                      isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    ❓ Help & Support
                  </button>

                  {/* Divider */}
                  <div className={`my-1 transition-colors ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  } border-t`}></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-sm transition flex items-center gap-2 ${
                      isDarkMode
                        ? 'text-red-400 hover:bg-red-900/20'
                        : 'text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ================================================================= */}
      {/* MODALS                                                            */}
      {/* ================================================================= */}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          isDarkMode={isDarkMode}
          onThemeToggle={onThemeToggle}
        />
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <HelpModal
          onClose={() => setShowHelpModal(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

export default Header;