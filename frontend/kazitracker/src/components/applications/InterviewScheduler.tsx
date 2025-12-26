// src/components/applications/InterviewScheduler.tsx

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  Plus,
} from 'lucide-react';

import type { Interview } from "../../types/Premium";

// ============================================
// 1. INTERVIEW SCHEDULER
// ============================================

export const InterviewScheduler = () => {
  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: '1',
      applicationId: 'app1',
      date: '2025-01-15',
      time: '10:00',
      type: 'phone',
      interviewer: 'John Smith',
      notes: 'Initial screening call',
      prepChecklist: [
        { task: 'Review job description', completed: true },
        { task: 'Prepare questions', completed: false },
        { task: 'Research company', completed: true },
      ],
      reminders: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const getDaysUntil = (date: string): number => {
    const today = new Date();
    const interviewDate = new Date(date);
    const diff = interviewDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getInterviewColor = (daysUntil: number): string => {
    if (daysUntil < 0) return 'bg-gray-100 border-gray-300';
    if (daysUntil === 0) return 'bg-red-50 border-red-300';
    if (daysUntil <= 3) return 'bg-orange-50 border-orange-300';
    return 'bg-blue-50 border-blue-300';
  };

  const handleDeleteInterview = (id: string) => {
    setInterviews(interviews.filter((i) => i.id !== id));
  };

  const togglePrepTask = (interviewId: string, taskIndex: number) => {
    setInterviews(
      interviews.map((interview) => {
        if (interview.id === interviewId) {
          const updated = [...interview.prepChecklist];
          updated[taskIndex].completed = !updated[taskIndex].completed;
          return { ...interview, prepChecklist: updated };
        }
        return interview;
      })
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Interview Scheduler</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Schedule Interview
        </button>
      </div>

      {/* Interview List */}
      <div className="space-y-4">
        {interviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No interviews scheduled</p>
        ) : (
          interviews.map((interview) => {
            const daysUntil = getDaysUntil(interview.date);
            const completedTasks = interview.prepChecklist.filter((t) => t.completed).length;

            return (
              <div
                key={interview.id}
                className={`border-l-4 p-4 rounded-lg ${getInterviewColor(daysUntil)}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize">
                        {interview.type}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          daysUntil < 0
                            ? 'bg-gray-200 text-gray-700'
                            : daysUntil === 0
                            ? 'bg-red-200 text-red-700'
                            : daysUntil <= 3
                            ? 'bg-orange-200 text-orange-700'
                            : 'bg-green-200 text-green-700'
                        }`}
                      >
                        {daysUntil < 0
                          ? 'Completed'
                          : daysUntil === 0
                          ? 'Today!'
                          : `${daysUntil} days`}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {interview.interviewer ? `Interview with ${interview.interviewer}` : 'Interview'}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSelectedInterview(interview)}
                      className="p-2 text-gray-600 hover:bg-white rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteInterview(interview.id)}
                      className="p-2 text-red-600 hover:bg-white rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(interview.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {interview.time}
                  </div>
                  {interview.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {interview.location}
                    </div>
                  )}
                  {interview.notes && <p className="text-gray-600 italic">{interview.notes}</p>}
                </div>

                {/* Prep Checklist */}
                <div className="bg-white bg-opacity-50 rounded p-3 space-y-2">
                  <p className="font-medium text-sm text-gray-700">
                    Prep Progress ({completedTasks}/{interview.prepChecklist.length})
                  </p>
                  <div className="space-y-1">
                    {interview.prepChecklist.map((task, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => togglePrepTask(interview.id, idx)}
                          className="w-4 h-4 rounded"
                        />
                        <span className={task.completed ? 'line-through text-gray-500' : ''}>
                          {task.task}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
