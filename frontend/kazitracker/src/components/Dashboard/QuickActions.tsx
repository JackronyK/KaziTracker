// src/components/Dashboard/QuickActions.tsx
/**
 * QuickActions Component
 * Fast navigation buttons to main features
 */

import { Plus, FileUp, Calendar, Briefcase } from 'lucide-react';

interface QuickActionsProps {
  onAddJob: () => void;
  onCreateApplication: () => void;
  onUploadResume: () => void;
  onViewCalendar: () => void;
}

/**
 * QuickActions Component
 * 
 * Props:
 * - onAddJob: Navigate to add job
 * - onCreateApplication: Navigate to create application
 * - onUploadResume: Navigate to upload resume
 * - onViewCalendar: Navigate to calendar
 * 
 * Features:
 * - Quick access buttons
 * - Color-coded actions
 * - Icons for each action
 * - Hover effects
 * - Responsive grid
 */
export const QuickActions = ({
  onAddJob,
  onCreateApplication,
  onUploadResume,
  onViewCalendar,
}: QuickActionsProps) => {
  const actions = [
    {
      label: 'Add Job',
      description: 'Save a new job posting',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onAddJob,
    },
    {
      label: 'New Application',
      description: 'Create an application',
      icon: <Plus className="w-6 h-6" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onCreateApplication,
    },
    {
      label: 'Upload Resume',
      description: 'Add a new resume file',
      icon: <FileUp className="w-6 h-6" />,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onUploadResume,
    },
    {
      label: 'View Calendar',
      description: 'Check interview schedule',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-amber-500 hover:bg-amber-600',
      onClick: onViewCalendar,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className={`${action.color} text-white rounded-lg p-4 transition transform hover:scale-105 flex flex-col items-center justify-center gap-2 shadow-md`}
          >
            {action.icon}
            <span className="font-semibold text-sm text-center">{action.label}</span>
            <span className="text-xs opacity-90 text-center">
              {action.description}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
        <p className="text-xs text-gray-600">
          ⚡ Keyboard shortcuts: {' '}
          <span className="font-mono bg-gray-200 px-1 rounded">J</span> = Job,{' '}
          <span className="font-mono bg-gray-200 px-1 rounded">A</span> = App,{' '}
          <span className="font-mono bg-gray-200 px-1 rounded">R</span> = Resume
        </p>
      </div>
    </div>
  );
};

export default QuickActions;