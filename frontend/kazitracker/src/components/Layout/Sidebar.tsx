// src/components/Layout/Sidebar.tsx

/**
 * Sidebar Navigation Component - ENHANCED
 * Collapsible left sidebar with smooth drawer animation
 */

import { BarChart3, Briefcase, FileText, CheckSquare, X, Zap, ChevronRight } from 'lucide-react';
import { logInfo } from '../../utils/errorLogger';

export type NavTab = 
  | 'dashboard' 
  | 'jobs' 
  | 'applications' 
  | 'resumes' 
  | 'premium'
  | 'profile'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isDarkMode?: boolean;
}

/**
 * Navigation items configuration
 */
const NAV_ITEMS: Array<{
  id: NavTab;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
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
  {
    id: 'premium',
    label: 'Premium Hub',
    icon: <Zap className="w-5 h-5" />,
    badge: 'New',
    description: 'Interviews • Offers • Deadlines',
  },
];

/**
 * Enhanced Sidebar Component
 * 
 * Features:
 * ✅ Smooth drawer animation
 * ✅ Mobile overlay
 * ✅ Responsive design
 * ✅ Active state highlighting
 * ✅ Dark mode support
 * ✅ Smooth transitions
 * ✅ Mobile-first approach
 * 
 * Usage:
 * <Sidebar 
 *   activeTab={activeTab} 
 *   onTabChange={setActiveTab}
 *   isOpen={mobileMenuOpen}
 *   onClose={closeMobileMenu}
 *   isDarkMode={isDark}
 * />
 */
export const Sidebar = ({ 
  activeTab, 
  onTabChange, 
  isOpen = false, 
  onClose,
  isDarkMode = false
}: SidebarProps) => {
  
  const handleTabChange = (tab: NavTab) => {
    logInfo('Navigation tab changed', { tab });
    onTabChange(tab);
    onClose?.();
  };

  return (
    <>
      {/* ================================================================= */ }
      {/* MOBILE OVERLAY - Dismiss drawer when clicked                      */ }
      {/* ================================================================= */ }
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ================================================================= */}
      {/* SIDEBAR CONTAINER - Smooth drawer animation                       */}
      {/* ================================================================= */}
      <aside
        className={`
          fixed left-0 top-16 bottom-0 w-64 z-30
          transition-all duration-300 ease-out
          lg:relative lg:top-0 lg:translate-x-0 lg:w-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isDarkMode 
            ? 'bg-gray-900 border-gray-800' 
            : 'bg-white border-gray-200'
          }
          border-r shadow-lg lg:shadow-none
        `}
      >
        {/* Close Button (Mobile Only) */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 lg:hidden p-2 rounded-lg transition ${
            isDarkMode
              ? 'hover:bg-gray-800 text-gray-400'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation */}
        <nav className="flex flex-col h-full p-4 pt-6 lg:pt-4 overflow-y-auto">
          
          {/* Logo Area (Mobile Only) */}
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <span className="text-white font-bold">💼</span>
              </div>
              <div>
                <p className={`font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  KaziTracker
                </p>
                <p className={`text-xs transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Job Tracker
                </p>
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
                    flex items-center gap-3 group relative
                    ${
                      isActive
                        ? isDarkMode
                          ? 'bg-blue-900/30 border-l-4 border-blue-500'
                          : 'bg-blue-50 border-l-4 border-blue-600'
                        : `border-l-4 border-transparent ${
                            isDarkMode
                              ? 'hover:bg-gray-800'
                              : 'hover:bg-gray-50'
                          }`
                    }
                  `}
                >
                  {/* Icon */}
                  <span
                    className={`transition-colors ${
                      isActive
                        ? isDarkMode
                          ? 'text-blue-400'
                          : 'text-blue-600'
                        : isDarkMode
                        ? 'text-gray-400 group-hover:text-gray-300'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Label & Description */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-medium text-sm transition-colors ${
                        isActive
                          ? isDarkMode
                            ? 'text-blue-400'
                            : 'text-blue-600'
                          : isDarkMode
                          ? 'text-gray-300 group-hover:text-gray-200'
                          : 'text-gray-700 group-hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className={`text-xs truncate transition-colors ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <span className="ml-auto px-2 py-1 bg-red-500/20 text-red-500 text-xs rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}

                  {/* Active Indicator (Right) */}
                  {isActive && (
                    <ChevronRight className={`ml-auto w-4 h-4 transition-colors ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Section */}
          <div className={`pt-4 border-t transition-colors ${
            isDarkMode ? 'border-gray-800' : 'border-gray-200'
          } space-y-2`}>
            {/* Version Info */}
            <div className={`px-4 py-3 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-800 text-gray-300'
                : 'bg-gray-50 text-gray-700'
            }`}>
              <p className={`text-xs font-medium transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Version
              </p>
              <p className={`text-sm font-semibold transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                v0.1.0
              </p>
            </div>

            {/* Help Link */}
            <button
              onClick={() => logInfo('Help clicked from sidebar')}
              className={`w-full text-left px-4 py-2 text-sm rounded-lg transition ${
                isDarkMode
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
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