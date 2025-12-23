// src/components/Dashboard/StatsChart.tsx
/**
 * StatsChart Component
 * Displays 30-day statistics as line chart
 */

import {
    Line,
    LineChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface StatsChartProps {
    data: Array<{
        date: string;
        applied: number;
        interviews: number;
        offers: number;
    }>;
}

/**
 * StatsChart Component
 * 
 * Props:
 * - data: Array of daily stats for 30 days
 * 
 * Features:
 * - Line chart visualization
 * - 3 metrics: applied, interviews, offers
 * - Color-coded lines
 * - Interactive tooltips
 * - Responsive sizing
 * - Legend
 */

export const StatsChart = ({ data }: StatsChartProps) => {
    // Custom tooltip
    const CustomTooltip = ({ active, payload, label}: any) => {
        if (active && payload && payload.length) {
            return (
                <div className='bg-white p-3 border border-gray-200 rounded shadow-lg'>
                    <p className=' font-semibold text-sm text-gray-900'>{label}</p>
                    {payload.map((entry: any, idx: number) => (
                        <p key={idx} style={{ color: entry.color}} className='text-sm'>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return (
            <div className='bg-white rounded-lg border-gray-200 p-8 text-center'>
                <p className='text-gray-500'>Not enough data for chart</p>
            </div>
        );
    }

    return (
        <div className='bg-white rounded-lg border border-gray-200 p-6'>
            <h3 className='text-lg font-bold text-gray-900 mb-6'>30-Day Trends</h3>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top:5, right: 30, left: 0, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB">
                        <XAxis
                            dataKey="date"
                            stroke="#9CA3AF"
                            style={{ fontSize: '12px' }}/>
                        <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="applied"
                            stroke="#3B82F6"
                            dot={{ fill: "#3B82F6", r: 4 }}
                            activeDot={{ r: 6}}
                            strokeWidth={2}
                            name="Applied"                            
                        />
                        <Line
                            type="monotone"
                            dataKey="interviews"
                            stroke="#A78BFA"
                            dot={{ fill: '#A78BFA', r: 4 }}
                            activeDot={{ r: 6 }}
                            strokeWidth={2}
                            name="Interviews"
                        />
                        <Line
                            type="monotone"
                            dataKey="offers"
                            stroke="#10B981"
                            dot={{ fill: '#10B981', r: 4 }}
                            activeDot={{ r: 6 }}
                            strokeWidth={2}
                            name="Offers"
                        />
                    </CartesianGrid>
                </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-xs text-gray-600 font-medium">Total Applied</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                        {data.reduce((sum, d) => sum + d.applied, 0)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-600 font-medium">Total Interviews</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">
                        {data.reduce((sum, d) => sum + d.interviews, 0)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-600 font-medium">Total Offers</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                        {data.reduce((sum, d) => sum + d.offers, 0)}
                    </p>
                </div>
            </div>

        </div>
    );
};

export default StatsChart;