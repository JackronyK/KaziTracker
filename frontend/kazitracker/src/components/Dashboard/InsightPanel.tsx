// src/components/Dashboard/InsightPanel.tsx
/**
 * InsightPanel Component
 * Displays smart recommendations and insights
 */

import { Lightbulb, TrendingUp, AlertCircle, Award } from "lucide-react";
import type React from "react";

interface InsightPanelProps {
    totalApps: number;
    appliedCount: number;
    interviewCount: number;
    offerCount: number;
    rejectedCount: number;
    interviewRate: number;
    successRate: number;
}

/**
 * InsightPanel Component
 * 
 * Props:
 * - totalApps: Total applications
 * - appliedCount: Applied count
 * - interviewCount: Interview count
 * - offerCount: Offer count
 * - rejectedCount: Rejection count
 * - interviewRate: Interview rate percentage
 * - successRate: Success rate percentage
 * 
 * Features:
 * - AI-powered insights
 * - Smart recommendations
 * - Performance alerts
 * - Motivational messages
 * - Actionable advice
 */
export const InsightPanel = ({
    totalApps,
    appliedCount,
    offerCount,
    rejectedCount,
    interviewRate,
    successRate,
}: InsightPanelProps ) => {
    // Generate insights based on data 
    const insights: Array<{
        icon: React.ReactNode;
        title: string;
        message: string;
        type: 'info' | 'warning' | 'success' | 'tip';
     }> = [];

     //insight 1: Interview Rate
     if (appliedCount > 0) {
        if (interviewRate >= 20) {
            insights.push({
                icon: <Award className="w-5 h-5" />,
                title: 'Excellent Interview Rate',
                message: `Your ${interviewRate.toFixed(1)}% interview rate is above average. Keep it up!`,
                type: 'success',                
            });
        } else if (interviewRate >= 10) {
            insights.push({
                icon: <TrendingUp className="w-5 h-5"/>,
                title: 'Good Interview Rate',
                message: `${interviewRate.toFixed(1)}% of your applications lead to interviews.`,
                type: 'info',
            });
        } else if (interviewRate > 0) {
            insights.push({
                icon: <AlertCircle className="w-5 h-5"/>,
                title: "Improve Application Quality",
                message: "Consider refining your resume or cover letters to increase interview rates. ",
                type: 'warning',
            });
        }
     }

     // Insight 2: Success Rate 
     if (totalApps > 0) {
        if (successRate >= 5) {
            insights.push({
                icon: <Award className="w-5 h-5" />,
                title: 'Great Success Rate!',
                message: `You have received ${offerCount} offer${offerCount !== 1 ? 's': ''} with a ${successRate.toFixed(1)}% success rate.`,
                type: 'success',
            });
        } else if (offerCount > 0) {
            insights.push({
                icon: <Lightbulb className="w-5 h-5"/>,
                title: "Offers Coming in",
                message: `You have ${offerCount} offer${offerCount !== 1 ? 's': ''} to consider. Evaluate carefully!`,
                type: 'success',
            });
        }
     }

     // insight 3: Activity Level
     if (totalApps === 0) {
        insights.push({
            icon: <Lightbulb className="w-5 h-5"/>,
            title: "Get Started!",
            message: "Add a job and create your first application ot start tracking  your progress.",
            type: 'tip',
        });
     } else if (appliedCount === 0 && totalApps > 0) {
        insights.push({
            icon: <AlertCircle className="w-5 h-5"/>,
            title: "Ready to Apply",
            message: `You have ${totalApps} job${totalApps !== 1 ? 's': ''} saved.Time to start applying!`,
            type: 'warning',
        });
     }

     // Insight 4: Consistency
     if (appliedCount > 10) {
        insights.push({
            icon: <TrendingUp className="w-5 h-5"/>,
            title: "Consistent Effort",
            message: `You have applied to ${appliedCount} positions. Consistency is key to success!`,
            type: 'success',
        });
     }

     //insight 5: Rejection Rate
     if (rejectedCount > 0 && appliedCount > 0) {
        const rejectionRate = (rejectedCount / appliedCount) * 100;
        if (rejectionRate < 50) {
            insights.push({
                icon: <Lightbulb className="w-5 h-5"/>,
                title: "Learn from Rejections",
                message: `You have had ${rejectionRate.toFixed(0)}% rejections. They are learning opportunities!`,
                type: 'tip',
            });
        }
     }

     // If no insights generated, we add a generic one
     if (insights.length === 0) {
        insights.push({
            icon: <Lightbulb className="w-5 h-5"/>,
            title: "Keep Going",
            message: "Your job search journey is underway. Stay persistent and positive!",
            type: 'tip',
        });
     }

     // Get background color for the insight  type
    const getBackgroundColor = (
        type: string
    ): { bg: string; text: string; icon: string } => {
        switch (type) {
        case 'success':
            return { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' };
        case 'warning':
            return { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-600' };
        case 'tip':
            return { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' };
        default:
            return { bg: 'bg-gray-50', text: 'text-gray-700', icon: 'text-gray-600' };
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500"/>
                Smart Insights
            </h3>

            <div className="space-y-3">
                {insights.map((insight, idx) => {
                    const colors = getBackgroundColor(insight.type);

                    return (
                        <div
                            key={idx}
                            className={`${colors.bg} border border-gray-200 rounded-lg p-4`}>
                                <div className="flex gap-3">
                                    <div className={`${colors.icon} flex-shrink-0 mt-0.5`}>
                                        {insight.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold ${colors.text}`}>
                                            {insight.title}
                                        </p>
                                        <p className={`text-sm ${colors.text} opacity-90 mt-1`}>
                                            {insight.message}
                                        </p>
                                    </div>
                                </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                    💡 Insights update in real-time as you progress
                </p>
            </div>
        </div>
    );
    };

    export default InsightPanel;