// src/components/Dashboard/AnalyticsCard.tsx
/**
 * AnalyticsCards Component
 * Displays key metrics in card format
 */

interface AnalyticsCardsProps {
  totalApps: number;
  appliedCount: number;
  interviewCount: number;
  offerCount: number;
  rejectedCount: number;
  interviewRate: number;
  successRate: number;
  hotStreak: number;
}

/**
 * AnalyticsCards Component
 * 
 * Props:
 * - totalApps: Total applications
 * - appliedCount: Applications applied to
 * - interviewCount: Interviews scheduled
 * - offerCount: Offers received
 * - rejectedCount: Rejections
 * - interviewRate: Interview rate percentage
 * - successRate: Success rate percentage
 * - hotStreak: Consecutive successes
 * 
 * Features:
 * - 8 key metric cards
 * - Color-coded by metric type
 * - Trending indicators
 * - Responsive grid
 */
export const AnalyticsCards = ({
  totalApps,
  appliedCount,
  interviewCount,
  offerCount,
  rejectedCount,
  interviewRate,
  successRate,
  hotStreak,
}: AnalyticsCardsProps) => {
  const cards = [
    {
      label: 'Total Applications',
      value: totalApps,
      icon: '📋',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-600',
      change: '+5 this month',
    },
    {
      label: 'Applied',
      value: appliedCount,
      icon: '📤',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-600',
      change: `${interviewRate.toFixed(1)}% interview rate`,
    },
    {
      label: 'Interviews',
      value: interviewCount,
      icon: '🎯',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-600',
      change: 'Scheduled & completed',
    },
    {
      label: 'Offers',
      value: offerCount,
      icon: '🎉',
      color: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-600',
      change: `${successRate.toFixed(1)}% success rate`,
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      icon: '❌',
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-600',
      change: 'Keep applying!',
    },
    {
      label: 'Interview Rate',
      value: `${interviewRate.toFixed(1)}%`,
      icon: '📊',
      color: 'bg-indigo-50 border-indigo-200',
      textColor: 'text-indigo-600',
      change: `${appliedCount > 0 ? interviewCount : 0} of ${appliedCount} apps`,
    },
    {
      label: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      icon: '🏆',
      color: 'bg-pink-50 border-pink-200',
      textColor: 'text-pink-600',
      change: `${offerCount} offers received`,
    },
    {
      label: 'Hot Streak 🔥',
      value: hotStreak,
      icon: '⚡',
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-600',
      change: 'Consecutive wins!',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.color} border rounded-lg p-5 transition hover:shadow-md`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {card.label}
              </p>
              <p className={`text-3xl font-bold ${card.textColor} mt-1`}>
                {card.value}
              </p>
            </div>
            <span className="text-2xl">{card.icon}</span>
          </div>
          <p className="text-xs text-gray-600">{card.change}</p>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsCards;