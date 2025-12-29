// src/components/applications/DeadlineTracker.tsx

import { useState } from 'react';
import {
  AlertCircle,
  Trash2,
} from 'lucide-react';

// ============================================
// 3. DEADLINE TRACKER
// ============================================

import type { Deadline } from '../../types/Premium';


export const DeadlineTracker = () => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([
    {
      id: '1',
      applicationId: 'app1',
      title: 'Respond to Tech Corp offer',
      dueDate: '2025-01-20',
      type: 'decision',
      priority: 'high',
      completed: false,
    },
    {
      id: '2',
      applicationId: 'app2',
      title: 'Send salary negotiation counter',
      dueDate: '2025-01-18',
      type: 'negotiation',
      priority: 'high',
      completed: false,
    },
  ]);

  const getDaysUntil = (date: string): number => {
    const today = new Date();
    const deadline = new Date(date);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const toggleDeadline = (id: string) => {
    setDeadlines(deadlines.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d)));
  };

  const deleteDeadline = (id: string) => {
    setDeadlines(deadlines.filter((d) => d.id !== id));
  };

  const sortedDeadlines = [...deadlines].sort((a, b) => {
    const daysA = getDaysUntil(a.dueDate);
    const daysB = getDaysUntil(b.dueDate);
    return daysA - daysB;
  });

  const getDeadlineIcon = (type: string) => {
    switch (type) {
      case 'response':
        return '📨';
      case 'decision':
        return '🎯';
      case 'negotiation':
        return '💬';
      default:
        return '📋';
    }
  };

  const getUrgencyColor = (days: number, completed: boolean): string => {
    if (completed) return 'bg-gray-100 border-gray-300';
    if (days < 0) return 'bg-gray-100 border-gray-300';
    if (days === 0) return 'bg-red-50 border-red-300';
    if (days <= 2) return 'bg-orange-50 border-orange-300';
    return 'bg-blue-50 border-blue-300';
  };

  const getUrgencyBadge = (days: number, completed: boolean): string => {
    if (completed) return 'bg-gray-200 text-gray-700';
    if (days < 0) return 'bg-gray-200 text-gray-700';
    if (days === 0) return 'bg-red-200 text-red-700 font-bold';
    if (days <= 2) return 'bg-orange-200 text-orange-700 font-bold';
    return 'bg-blue-200 text-blue-700';
  };

  const stats = {
    total: deadlines.length,
    completed: deadlines.filter((d) => d.completed).length,
    urgent: deadlines.filter((d) => !d.completed && getDaysUntil(d.dueDate) <= 2).length,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-900">Deadline Tracker</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Total Deadlines</p>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-gray-600 text-sm">Urgent</p>
          <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
        </div>
      </div>

      {/* Deadlines Timeline */}
      <div className="space-y-3">
        {sortedDeadlines.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No deadlines</p>
        ) : (
          sortedDeadlines.map((deadline) => {
            const daysUntil = getDaysUntil(deadline.dueDate);

            return (
              <div
                key={deadline.id}
                className={`border-l-4 p-4 rounded-lg flex items-center gap-4 ${getDeadlineIcon(
                  deadline.type
                )} transition ${getDeadlineIcon(deadline.type)} ${getDeadlineIcon(
                  deadline.type
                )} ${getUrgencyColor(daysUntil, deadline.completed)}`}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={deadline.completed}
                  onChange={() => toggleDeadline(deadline.id)}
                  className="w-5 h-5 rounded cursor-pointer"
                />

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{getDeadlineIcon(deadline.type)}</span>
                    <h3
                      className={`font-semibold ${
                        deadline.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {deadline.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(deadline.dueDate).toLocaleDateString()} •{' '}
                    <span className={`font-medium ${getUrgencyBadge(daysUntil, deadline.completed)}`}>
                      {daysUntil < 0
                        ? 'Overdue'
                        : daysUntil === 0
                        ? 'Due Today!'
                        : `${daysUntil} days left`}
                    </span>
                  </p>
                  {deadline.notes && <p className="text-xs text-gray-500 mt-1">{deadline.notes}</p>}
                </div>

                {/* Priority Badge */}
                <span
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    deadline.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : deadline.priority === 'medium'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)}
                </span>

                {/* Delete Button */}
                <button
                  onClick={() => deleteDeadline(deadline.id)}
                  className="p-2 text-gray-600 hover:bg-white rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};