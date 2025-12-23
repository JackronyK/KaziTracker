// src/components/Dashboard/GoalTracker.tsx
/**
 * GoalTracker Component
 * Displays progress towards goals
 */

import { Target, TrendingUp } from 'lucide-react';

interface GoalTrackerProps {
  appliedCount: number;
  interviewCount: number;
  offerCount: number;
}

/**
 * GoalTracker Component
 * 
 * Props:
 * - appliedCount: Current applications
 * - interviewCount: Current interviews
 * - offerCount: Current offers
 * 
 * Features:
 * - Goal visualization
 * - Progress bars
 * - Percentage complete
 * - Motivational messages
 * - Status indicators
 */
export const GoalTracker = ({
  appliedCount,
  interviewCount,
  offerCount,
}: GoalTrackerProps) => {
  // Define goals
  const goals = [
    {
      title: 'Applications Target',
      current: appliedCount,
      target: 20,
      color: 'bg-blue-500',
      icon: '📤',
      description: 'Apply to companies',
    },
    {
      title: 'Interview Goal',
      current: interviewCount,
      target: 5,
      color: 'bg-purple-500',
      icon: '🎯',
      description: 'Schedule interviews',
    },
    {
      title: 'Offer Target',
      current: offerCount,
      target: 2,
      color: 'bg-green-500',
      icon: '🎉',
      description: 'Receive offers',
    },
  ];

  // Get status emoji
  const getStatus = (current: number, target: number): string => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return '🏆'; // Complete
    if (percentage >= 75) return '🔥'; // Almost there
    if (percentage >= 50) return '⭐'; // Halfway
    return '🚀'; // Just starting
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600" />
        Monthly Goals
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Track your progress towards your job search goals
      </p>

      <div className="space-y-6">
        {goals.map((goal, idx) => {
          const percentage = Math.min((goal.current / goal.target) * 100, 100);
          const isComplete = goal.current >= goal.target;
          const status = getStatus(goal.current, goal.target);

          return (
            <div key={idx} className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{goal.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{goal.title}</p>
                    <p className="text-xs text-gray-600">{goal.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{status}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`${goal.color} h-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">
                  {goal.current} / {goal.target}
                </span>
                <span
                  className={`font-medium ${
                    isComplete ? 'text-green-600' : 'text-gray-600'
                  }`}
                >
                  {Math.round(percentage)}%
                </span>
              </div>

              {/* Motivational Message */}
              {isComplete ? (
                <div className="text-xs text-green-700 bg-green-50 p-2 rounded mt-2">
                  ✅ Goal achieved! Great work!
                </div>
              ) : percentage >= 50 ? (
                <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded mt-2">
                  🎯 You're {Math.round(percentage)}% of the way there!
                </div>
              ) : percentage > 0 ? (
                <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2">
                  Keep pushing! {goal.target - goal.current} to go.
                </div>
              ) : (
                <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded mt-2">
                  Get started! {goal.target} to reach your goal.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Overall Progress</span>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {Math.round(
              ((appliedCount / 20 + interviewCount / 5 + offerCount / 2) / 3) *
                100
            )}
            %
          </span>
        </div>
      </div>
    </div>
  );
};

export default GoalTracker;