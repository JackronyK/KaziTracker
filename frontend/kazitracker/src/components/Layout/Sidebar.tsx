// src/components/Layout/Sidebar.tsx
/**
 * Sidebar Navigation Component
 * Left sidebar with navigation tabs
 */

import { BarChart3, Briefcase, FileText, CheckSquare, X } from 'lucide-react';
import { logInfo } from '../../utils/errorLogger';

export type NavTab = 'dashboard' | 'jobs' | 'applications' | 'resumes';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Navigation items configuration
 */
const NAV_ITEMS: Array<{
  id: NavTab;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Analytics & insights',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: <Briefcase className="w-5 h-5" />,
    description: 'Manage positions',
  },
  {
    id: 'applications',
    label: 'Applications',
    icon: <CheckSquare className="w-5 h-5" />,
    description: 'Track applications',
  },
  {
    id: 'resumes',
    label: 'Resumes',
    icon: <FileText className="w-5 h-5" />,
    description: 'Manage CVs',
  },
];

/**
 * Sidebar Component
 * 
 * Features:
 * - Navigation tabs
 * - Active state highlighting
 * - Mobile responsive
 * - Icon + label display
 * 
 * Usage:
 * <Sidebar 
 *   activeTab={activeTab} 
 *   onTabChange={setActiveTab}
 *   isOpen={mobileMenuOpen}
 *   onClose={closeMobileMenu}
 * />
 */
export const Sidebar = ({ activeTab, onTabChange, isOpen, onClose }: SidebarProps) => {
  const handleTabChange = (tab: NavTab) => {
    logInfo('Navigation tab changed', { tab });
    onTabChange(tab);
    onClose?.(); // Close mobile menu after selection
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-30
          transition-transform duration-200 ease-out
          lg:relative lg:top-0 lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col h-full p-4 pt-6 lg:pt-4">
          {/* Logo Area (Mobile) */}
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <span className="text-white font-bold">💼</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">KaziTracker</p>
                <p className="text-xs text-gray-500">Job Tracker</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2 flex-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg transition
                    flex items-center gap-3 group
                    ${
                      isActive
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }
                  `}
                >
                  {/* Icon */}
                  <span
                    className={`
                      transition
                      ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}
                    `}
                  >
                    {item.icon}
                  </span>

                  {/* Label & Description */}
                  <div className="min-w-0">
                    <p
                      className={`
                        font-medium transition
                        ${isActive ? 'text-blue-600' : 'text-gray-700 group-hover:text-gray-900'}
                      `}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.description}
                    </p>
                  </div>

                  {/* Active Indicator (Right) */}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Section */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            {/* Version Info */}
            <div className="px-4 py-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600">Version</p>
              <p className="text-sm text-gray-700 font-semibold">v0.1.0</p>
            </div>

            {/* Help Link */}
            <button
              onClick={() => logInfo('Help clicked from sidebar')}
              className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
            >
              ❓ Need Help?
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;