// src/components/applications/ResumePerformance.tsx

import { useState } from 'react';
import {
  TrendingUp,
} from 'lucide-react';

// ============================================
// 4. RESUME PERFORMANCE
// ============================================

import type { ResumeVersion } from '../../types/Premium';



export const ResumePerformance = () => {
  const [resumes, setResumes] = useState<ResumeVersion[]>([
    {
      id: '1',
      name: 'Resume_v1_TechFocus.pdf',
      uploadedDate: '2024-12-01',
      applicationsCount: 15,
      successRate: 33.3,
      interviews: 5,
      offers: 1,
      rejections: 9,
    },
    {
      id: '2',
      name: 'Resume_v2_BoldFormat.pdf',
      uploadedDate: '2024-12-15',
      applicationsCount: 22,
      successRate: 45.5,
      interviews: 10,
      offers: 3,
      rejections: 9,
    },
  ]);

  const getSuccessRateColor = (rate: number): string => {
    if (rate >= 50) return 'text-green-600 bg-green-50';
    if (rate >= 30) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getBestPerformer = (): ResumeVersion | null => {
    return resumes.length > 0
      ? resumes.reduce((best, current) =>
          current.successRate > best.successRate ? current : best
        )
      : null;
  };

  const topResume = getBestPerformer();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">Resume Performance</h2>
      </div>

      {/* Best Performer */}
      {topResume && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-purple-900 font-medium mb-2">🏆 Best Performing Resume</p>
          <p className="font-semibold text-gray-900">{topResume.name}</p>
          <p className="text-sm text-purple-700 mt-1">
            {topResume.successRate.toFixed(1)}% success rate ({topResume.interviews} interviews,{' '}
            {topResume.offers} offers)
          </p>
        </div>
      )}

      {/* Resume Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Resume</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Applications</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Success Rate</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Interviews</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Offers</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Rejections</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((resume) => (
              <tr key={resume.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{resume.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(resume.uploadedDate).toLocaleDateString()}
                    </p>
                  </div>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="font-semibold text-gray-900">{resume.applicationsCount}</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-sm ${getSuccessRateColor(
                      resume.successRate
                    )}`}
                  >
                    {resume.successRate.toFixed(1)}%
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="font-semibold text-blue-600">{resume.interviews}</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="font-semibold text-green-600">{resume.offers}</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="font-semibold text-red-600">{resume.rejections}</span>
                </td>
                <td className="text-center py-3 px-4 text-sm text-gray-600">
                  {new Date(resume.uploadedDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-2">📊 Average Performance</p>
          <p className="text-2xl font-bold text-blue-600">
            {(
              resumes.reduce((sum, r) => sum + r.successRate, 0) / (resumes.length || 1)
            ).toFixed(1)}
            %
          </p>
          <p className="text-xs text-blue-700 mt-1">across all resumes</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-900 font-medium mb-2">🎯 Total Success Stories</p>
          <p className="text-2xl font-bold text-green-600">
            {resumes.reduce((sum, r) => sum + r.interviews + r.offers, 0)}
          </p>
          <p className="text-xs text-green-700 mt-1">interviews + offers combined</p>
        </div>
      </div>

      {resumes.length === 0 && (
        <p className="text-gray-500 text-center py-12">No resume data yet</p>
      )}
    </div>
  );
};