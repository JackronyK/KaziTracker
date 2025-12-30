
// ============================================================================
// src/components/Layout/Sidebar.tsx
// ============================================================================

import { BarChart3, Briefcase, FileText, CheckSquare, X, Zap, ChevronRight } from 'lucide-react';
import { logInfo } from '../../utils/errorLogger';
import { useEffect, useState } from 'react';

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

export const Sidebar = ({ 
  activeTab, 
  onTabChange, 
  isOpen = false, 
  onClose,
  isDarkMode = false
}: SidebarProps) => {
  const [startX, setStartX] = useState(0);

  const handleTabChange = (tab: NavTab) => {
    logInfo('Navigation tab changed', { tab });
    onTabChange(tab);
    onClose?.();
  };

  // Handle touch swipe to close drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      setStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      if (endX - startX > 50 && startX < 50) {
        onClose?.();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchend', handleTouchEnd, false);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, startX, onClose]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        />
      )}

      {/* Sidebar - FIXED: Now properly positioned on desktop */}
      <aside
        className={`
          w-64 flex-shrink-0 z-30 lg:z-auto
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          
          /* Mobile: Fixed overlay drawer */
          fixed left-0 top-16 bottom-0 lg:top-0
          shadow-lg lg:shadow-none
          
          /* Desktop: Normal flow */
          lg:relative lg:w-64 lg:flex-shrink-0
          
          transition-transform duration-300 ease-out lg:transition-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Close Button (Mobile only) */}
        <button
          onClick={onClose}
          className={`
            absolute top-4 right-4 lg:hidden p-2 rounded-lg transition
            ${isDarkMode
              ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
            }
          `}
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation Content */}
        <nav className="flex flex-col h-full p-4 pt-6 lg:pt-4 overflow-y-auto">
          
          {/* Logo Area (Mobile only) */}
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <span className="text-white font-bold text-lg">💼</span>
              </div>
              <div>
                <p className={`font-bold text-sm ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  KaziTracker
                </p>
                <p className={`text-xs ${
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
                    w-full text-left px-4 py-3 rounded-lg transition-all
                    flex items-center gap-3 group relative
                    ${
                      isActive
                        ? isDarkMode
                          ? 'bg-blue-900/40 border-l-4 border-blue-500 text-blue-400'
                          : 'bg-blue-50 border-l-4 border-blue-600 text-blue-600'
                        : `border-l-4 border-transparent ${
                            isDarkMode
                              ? 'hover:bg-gray-800/50 text-gray-400 hover:text-gray-300'
                              : 'hover:bg-gray-100 text-gray-600'
                          }`
                    }
                  `}
                >
                  {/* Icon */}
                  <span className={`flex-shrink-0 transition-colors ${
                    isActive
                      ? isDarkMode
                        ? 'text-blue-400'
                        : 'text-blue-600'
                      : isDarkMode
                      ? 'text-gray-500 group-hover:text-gray-400'
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`}>
                    {item.icon}
                  </span>

                  {/* Label & Description */}
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-sm`}>
                      {item.label}
                    </p>
                    <p className={`text-xs truncate ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Badge */}
                  {item.badge && (
                    <span className="ml-auto px-2 py-1 bg-red-500/20 text-red-500 dark:text-red-400 text-xs rounded-full font-bold flex-shrink-0">
                      {item.badge}
                    </span>
                  )}

                  {/* Active Indicator */}
                  {isActive && (
                    <ChevronRight className="ml-auto w-4 h-4 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Section */}
          <div className={`pt-4 border-t ${
            isDarkMode ? 'border-gray-800' : 'border-gray-200'
          } space-y-2 mt-auto`}>
            {/* Version Info */}
            <div className={`px-4 py-3 rounded-lg ${
              isDarkMode
                ? 'bg-gray-800/50 text-gray-300'
                : 'bg-gray-50 text-gray-700'
            }`}>
              <p className={`text-xs font-medium ${
                isDarkMode ? 'text-gray-500' : 'text-gray-600'
              }`}>
                Version
              </p>
              <p className={`text-sm font-semibold ${
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
                  ? 'text-gray-500 hover:text-gray-400 hover:bg-gray-800/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              ❓ Need Help?
            </button>
          </div>
        </nav>
      </aside>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        aside {
          will-change: transform;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </>
  );
};

export default Sidebar;