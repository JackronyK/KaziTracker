// src/components/Layout/Header.tsx
/**
 * Header Component
 * Top navigation bar with user menu and app branding
 */

import { LogOut, Menu, X, Bell, Settings } from 'lucide-react';
import { useState } from 'react';
import type { User } from '../../types';
import { logInfo } from '../../utils/errorLogger';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onMenuToggle?: (isOpen: boolean) => void;
}

/**
 * Header Component
 * 
 * Features:
 * - User info display
 * - Logout button
 * - Notifications (placeholder)
 * - Settings (placeholder)
 * - Mobile menu toggle
 * 
 * Usage:
 * <Header user={user} onLogout={handleLogout} onMenuToggle={setMobileMenuOpen} />
 */
export const Header = ({ user, onLogout, onMenuToggle }: HeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    onMenuToggle?.(newState);
    logInfo('Mobile menu toggled', { isOpen: newState });
  };

  const handleLogout = () => {
    logInfo('Logout clicked');
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Section: Logo & Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={handleMenuToggle}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Logo & Title */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg hidden sm:block">
              <span className="text-white font-bold text-lg">💼</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">KaziTracker</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Job Application Manager</p>
            </div>
          </div>
        </div>

        {/* Right Section: Actions & User Menu */}
        <div className="flex items-center gap-4">
          {/* Notifications (Placeholder) */}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings (Placeholder) */}
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition hidden sm:block"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200"></div>

          {/* User Menu */}
          <div className="relative">
            {/* User Button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>

              {/* User Info (Desktop) */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email || ''}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {/* User Info (Mobile) */}
                <div className="sm:hidden px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.email || 'User'}</p>
                  <p className="text-xs text-gray-500 mt-1">Account</p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logInfo('Profile clicked');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  👤 Profile
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logInfo('Settings clicked');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  ⚙️ Settings
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logInfo('Help clicked');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  ❓ Help & Support
                </button>

                {/* Divider */}
                <div className="my-1 border-t border-gray-200"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition flex items-center gap-2"
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
  );
};

export default Header;