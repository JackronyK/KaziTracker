// src/components/Layout/NotificationsDropdown.tsx

import { Bell, X, AlertCircle, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { logInfo, logError } from '../../utils/errorLogger';

interface Notification {
  id: string;
  type: 'deadline' | 'interview' | 'offer';
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
}

interface NotificationsDropdownProps {
  isDarkMode?: boolean;
  deadlines?: any[];
  interviews?: any[];
  offers?: any[];
}

export const NotificationsDropdown = ({
  isDarkMode = false,
  deadlines = [],
  interviews = [],
  offers = [],
}: NotificationsDropdownProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>({});

  // Calculate notifications
  useEffect(() => {
    const allNotifications: Notification[] = [];
    const debug = {
      deadlinesReceived: deadlines?.length || 0,
      interviewsReceived: interviews?.length || 0,
      offersReceived: offers?.length || 0,
      deadlinesSample: deadlines?.[0],
    };

    console.log('📢 Notifications component received:', debug);

    try {
      // ===== PROCESS DEADLINES =====
      if (deadlines && Array.isArray(deadlines) && deadlines.length > 0) {
        console.log('📌 Processing deadlines:', deadlines);
        
        deadlines.forEach((deadline, idx) => {
          try {
            // Try all possible field names for date
            let dueDate = null;
            let dateFieldUsed = '';

            const dateFields = [
              'due_date', 'dueDate', 'deadline_date', 'date', 
              'deadline', 'endDate', 'scheduled_date', 'target_date'
            ];

            for (const field of dateFields) {
              if (deadline[field]) {
                dueDate = new Date(deadline[field]);
                dateFieldUsed = field;
                
                // Validate the date
                if (!isNaN(dueDate.getTime())) {
                  break;
                } else {
                  dueDate = null;
                }
              }
            }

            if (!dueDate || isNaN(dueDate.getTime())) {
              console.warn('⚠️ Skipping deadline with invalid date:', deadline);
              return;
            }

            // Normalize dates to start of day for proper comparison
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);

            const daysUntil = Math.ceil(
              (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            console.log(`📌 Deadline: ${deadline.title || 'Untitled'}, Days until: ${daysUntil}`);

            // Show deadlines within 7 days (including overdue)
            if (daysUntil >= -1 && daysUntil <= 7) {
              const priority =
                daysUntil < 0 ? 'high' :
                daysUntil === 0 ? 'high' :
                daysUntil <= 1 ? 'high' :
                daysUntil <= 3 ? 'medium' :
                'low';

              const title = deadline.title || deadline.name || 'Upcoming deadline';
              let description = '';

              if (daysUntil < 0) {
                description = `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`;
              } else if (daysUntil === 0) {
                description = 'Due today!';
              } else {
                description = `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
              }

              allNotifications.push({
                id: `deadline-${deadline.id || idx}`,
                type: 'deadline',
                title: `📌 ${title}`,
                description,
                dueDate: dueDate.toISOString(),
                priority,
                icon: <AlertCircle className="w-5 h-5" />,
              });

              console.log('✅ Added deadline notification:', { title, daysUntil, dateFieldUsed });
            }
          } catch (err) {
            console.error('❌ Error processing deadline:', err, deadline);
          }
        });
      } else {
        console.warn('⚠️ No deadlines received or not an array');
      }

      // ===== PROCESS INTERVIEWS =====
      if (interviews && Array.isArray(interviews) && interviews.length > 0) {
        console.log('🗓️ Processing interviews:', interviews);
        
        interviews.forEach((interview, idx) => {
          try {
            let interviewDate = null;
            const dateFields = ['date', 'interview_date', 'scheduled_date', 'start_date'];

            for (const field of dateFields) {
              if (interview[field]) {
                interviewDate = new Date(interview[field]);
                if (!isNaN(interviewDate.getTime())) {
                  break;
                } else {
                  interviewDate = null;
                }
              }
            }

            if (!interviewDate || isNaN(interviewDate.getTime())) {
              return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            interviewDate.setHours(0, 0, 0, 0);

            const daysUntil = Math.ceil(
              (interviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Show interviews within 3 days
            if (daysUntil > 0 && daysUntil <= 3) {
              const jobTitle = interview.job_title || interview.position || 'Interview';
              
              allNotifications.push({
                id: `interview-${interview.id || idx}`,
                type: 'interview',
                title: `🗓️ Interview: ${jobTitle}`,
                description: `Interview in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
                dueDate: interviewDate.toISOString(),
                priority: 'high',
                icon: <Calendar className="w-5 h-5" />,
              });

              console.log('✅ Added interview notification:', { jobTitle, daysUntil });
            }
          } catch (err) {
            console.error('❌ Error processing interview:', err);
          }
        });
      }

      // ===== PROCESS OFFERS =====
      if (offers && Array.isArray(offers) && offers.length > 0) {
        console.log('💰 Processing offers:', offers);
        
        const pendingOffers = offers.filter(
          (offer) => offer.status?.toLowerCase?.() === 'pending' || offer.status === 'pending'
        );

        if (pendingOffers.length > 0) {
          allNotifications.push({
            id: 'offers-pending',
            type: 'offer',
            title: `💰 ${pendingOffers.length} Pending Offer${pendingOffers.length > 1 ? 's' : ''}`,
            description: 'Review and respond to your pending offers',
            dueDate: new Date().toISOString(),
            priority: 'high',
            icon: <DollarSign className="w-5 h-5" />,
          });

          console.log('✅ Added offer notification:', { count: pendingOffers.length });
        }
      }

      // Sort by priority and date
      allNotifications.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.length);
      setDebugInfo(debug);

      console.log('✅ Final notifications:', {
        total: allNotifications.length,
        deadlines: allNotifications.filter(n => n.type === 'deadline').length,
        interviews: allNotifications.filter(n => n.type === 'interview').length,
        offers: allNotifications.filter(n => n.type === 'offer').length,
      });
    } catch (err) {
      console.error('❌ Error calculating notifications:', err);
      logError('Error calculating notifications', err as Error);
    }
  }, [deadlines, interviews, offers]);

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    logInfo('Notification dismissed', { id });
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    logInfo('All notifications cleared');
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`p-2 rounded-lg transition relative ${
          isDarkMode
            ? 'hover:bg-gray-800 text-gray-300'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
        title={`Notifications (${unreadCount})`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className={`absolute right-0 mt-2 w-96 rounded-lg shadow-xl border z-50 transition-colors ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 border-b transition-colors ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell
                className={`w-5 h-5 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}
              />
              <h3
                className={`font-semibold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Notifications
              </h3>
            </div>
            <button
              onClick={() => setShowDropdown(false)}
              className={`p-1 rounded transition ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Debug Info (Dev) */}
          {/* {process.env.NODE_ENV === 'development' && (
            <div className={`px-4 py-2 text-xs border-b ${
              isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'
            }`}>
              <div>📦 Deadlines: {debugInfo.deadlinesReceived} | 🗓️ Interviews: {debugInfo.interviewsReceived} | 💰 Offers: {debugInfo.offersReceived}</div>
            </div>
          )} */}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div
                className={`p-8 text-center transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs mt-1">No pending notifications</p>
              </div>
            ) : (
              <div className="divide-y transition-colors">
                {notifications.map((notification) => {
                  const iconBgColor =
                    notification.type === 'deadline'
                      ? isDarkMode
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-red-50 text-red-600'
                      : notification.type === 'interview'
                      ? isDarkMode
                        ? 'bg-blue-900/30 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                      : isDarkMode
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-green-50 text-green-600';

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors ${
                        isDarkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${iconBgColor}`}>
                          {notification.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold transition-colors ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p
                            className={`text-xs mt-1 transition-colors ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {notification.description}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDismiss(notification.id)}
                          className={`p-1 rounded transition flex-shrink-0 ${
                            isDarkMode
                              ? 'hover:bg-gray-600 text-gray-400'
                              : 'hover:bg-gray-200 text-gray-400'
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className={`p-3 border-t text-center transition-colors ${
                isDarkMode
                  ? 'border-gray-700 bg-gray-800'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <button
                onClick={handleClearAll}
                className={`text-xs font-medium transition ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Close on outside click */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default NotificationsDropdown;