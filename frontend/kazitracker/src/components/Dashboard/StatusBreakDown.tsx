// src/components/Dashboard/StatusBreakDown.tsx
/**
 * StatusBreakdown Component
 * Displays application status distribution as pie chart
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatusBreakdownProps {
  saved: number;
  applied: number;
  interview: number;
  offer: number;
  rejected: number;
}

/**
 * StatusBreakdown Component
 * 
 * Props:
 * - saved: Saved applications count
 * - applied: Applied count
 * - interview: Interview count
 * - offer: Offer count
 * - rejected: Rejected count
 * 
 * Features:
 * - Pie chart visualization
 * - Color-coded by status
 * - Legend with counts
 * - Responsive sizing
 * - Hover tooltips
 */
export const StatusBreakdown = ({
  saved,
  applied,
  interview,
  offer,
  rejected,
}: StatusBreakdownProps) => {
  const data = [
    { name: 'Saved', value: saved, percentage: 0 },
    { name: 'Applied', value: applied, percentage: 0 },
    { name: 'Interview', value: interview, percentage: 0 },
    { name: 'Offer', value: offer, percentage: 0 },
    { name: 'Rejected', value: rejected, percentage: 0 },
  ];

  const total = saved + applied + interview + offer + rejected;

  // Calculate percentages
  data.forEach((item) => {
    item.percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
  });

  // Filter out zero values for cleaner chart
  const chartData = data.filter((item) => item.value > 0);

  const COLORS = {
    Saved: '#9CA3AF',
    Applied: '#3B82F6',
    Interview: '#A78BFA',
    Offer: '#10B981',
    Rejected: '#EF4444',
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  if (total === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No applications yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Status Breakdown</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ payload }) => {
                    if (!payload) return '';
                    return `${payload.name} (${payload.percentage}%)`;
                  }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with details */}
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: COLORS[item.name as keyof typeof COLORS],
                  }}
                ></div>
                <span className="font-medium text-gray-700">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-600">{item.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusBreakdown;