// src/components/applications/InterviewScheduler.tsx
import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import type { Interview } from '../../types/Premium';
import type { UseInterviewsReturn } from '../../hooks/useInterviews';
import { useToast } from '../../hooks/useToast';
import { ApplicationSelector } from '../ui/ApplicationSelector';
import type { Application } from '../../types/index';
import { apiClient } from '../../api';

interface InterviewSchedulerProps extends UseInterviewsReturn {
  toast: ReturnType<typeof useToast>;
}

export const InterviewScheduler = ({
  interviews,
  operationLoading,
  addInterview,
  updateInterview,
  deleteInterview,
  togglePrepTask,
  toast,
}: InterviewSchedulerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // =========================================================================
  // FETCH APPLICATIONS FOR SELECTOR
  // =========================================================================
  
  useEffect(() => {
    const fetchApplications = async () => {
      setAppsLoading(true);
      try {
        const data = await apiClient.listApplications();        
        setApplications(data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setApplications([]); // Ensure it's always an array
      } finally {
        setAppsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // =========================================================================
  // FORM STATE
  // =========================================================================

  const emptyForm = {
    applicationId: 0,
    date: '',
    time: '',
    type: 'phone' as 'phone' | 'video' | 'in-person',
    interviewer: '',
    location: '',
    notes: '',
    prepChecklist: [
      { task: 'Review job description', completed: false },
      { task: 'Research company', completed: false },
      { task: 'Prepare questions', completed: false },
    ],
    reminders: true,
  };

  const [formData, setFormData] = useState(emptyForm);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleOpenForm = (interview?: Interview) => {
    if (interview) {
      setEditingInterview(interview);
      
      // Extract prep checklist - handle all possible formats
      let prepChecklist = [];
      const rawChecklist = (interview as any).prep_checklist || (interview as any).prepChecklist;

      if (typeof rawChecklist === 'string') {
        try {
          const parsed = JSON.parse(rawChecklist);
          
          if (Array.isArray(parsed)) {
            // If it's a proper array of objects
            prepChecklist = parsed.map((item: any) => ({
              task: item.description || item.task || '',
              completed: item.completed || false
            }));
          } else if (typeof parsed === 'object' && parsed !== null) {
            // If it's an object with indexed keys (corrupted data)
            const items = Object.values(parsed).filter(item => 
              typeof item === 'object' && item !== null
            );
            prepChecklist = items.map((item: any) => ({
              task: item.description || item.task || '',
              completed: item.completed || false
            }));
          } else {
            prepChecklist = [];
          }
        } catch (e) {
          console.error('Failed to parse prep_checklist:', e);
          prepChecklist = [];
        }
      } else if (Array.isArray(rawChecklist)) {
        // If it's already a clean array
        prepChecklist = rawChecklist.map((item: any) => ({
          task: item.description || item.task || '',
          completed: item.completed || false
        }));
      } else {
        prepChecklist = [];
      }

      setFormData({
        applicationId: (interview as any).application_id || (interview as any).applicationId || 0,
        date: interview.date || '',
        time: (interview as any).time || '',
        type: (interview as any).type || 'phone',
        interviewer: (interview as any).interviewer || '',
        location: (interview as any).location || '',
        notes: (interview as any).notes || '',
        prepChecklist: prepChecklist,
        reminders: (interview as any).reminders !== false,
      });
    } else {
      setEditingInterview(null);
      setFormData(emptyForm);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingInterview(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  if (!validatePrepChecklist(formData.prepChecklist)) {
    toast.error('Invalid Prep Checklist', 'All tasks must have non-empty descriptions');
    return;
  }

    // Validation
    if (formData.applicationId === 0) {
      toast.error('Validation Error', 'Please select an application');
      return;
    }

    if (!formData.date || !formData.time) {
      toast.error('Validation Error', 'Date and time are required');
      return;
    }

    // ✅ FIX: Normalize prep checklist BEFORE sending to API
    const normalizedPrepChecklist = formData.prepChecklist
      .filter(item => typeof item.task === 'string' && item.task.trim().length > 0)
      .map(item => ({
        description: item.task.trim(),
        completed: item.completed,
      }));

    // Prepare payload - use snake_case for API
    const payload = {
      application_id: formData.applicationId,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      interviewer: formData.interviewer || null,
      location: formData.location || null,
      notes: formData.notes || null,
      prep_checklist: normalizedPrepChecklist, // ✅ Send proper array of objects
      reminders: formData.reminders,
    };

    if (editingInterview) {
      const result = await updateInterview(editingInterview.id, payload);
      if (result) {
        toast.success('Interview Updated', 'Your interview has been updated successfully');
        handleCloseForm();
      } else {
        toast.error('Update Failed', 'Failed to update interview');
      }
    } else {
      const result = await addInterview(payload);
      if (result) {
        toast.success('Interview Scheduled', 'Your interview has been scheduled successfully');
        handleCloseForm();
      } else {
        toast.error('Creation Failed', 'Failed to schedule interview');
      }
    }
  };

  const handleDelete = async (id: number) => {
    const result = await deleteInterview(id);
    if (result) {
      toast.success('Interview Deleted', 'Interview has been removed');
      setShowDeleteConfirm(null);
    } else {
      toast.error('Deletion Failed', 'Failed to delete interview');
    }
  };

  const handleTogglePrepTask = async (interviewId: number, taskIndex: number) => {
    const result = await togglePrepTask(interviewId, taskIndex);
    if (!result) {
      toast.error('Update Failed', 'Failed to update prep checklist');
    }
  };

  const addPrepChecklistItem = () => {
    setFormData({
      ...formData,
      prepChecklist: [...formData.prepChecklist, { task: '', completed: false }],
    });
  };

  const updatePrepChecklistItem = (index: number, task: string) => {
    const updated = [...formData.prepChecklist];
    updated[index] = { ...updated[index], task };
    setFormData({ ...formData, prepChecklist: updated });
  };

  const removePrepChecklistItem = (index: number) => {
    setFormData({
      ...formData,
      prepChecklist: formData.prepChecklist.filter((_, i) => i !== index),
    });
  };

  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================

  const getDaysUntil = (date: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const interviewDate = new Date(date);
    interviewDate.setHours(0, 0, 0, 0);
    const diff = interviewDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const validatePrepChecklist = (checklist: any[]): boolean => {
  return checklist.every(item => 
    typeof item === 'object' && 
    item !== null && 
    typeof item.task === 'string' && 
    item.task.trim().length > 0
  );
  };

  const getInterviewColor = (daysUntil: number): string => {
    if (daysUntil < 0) return 'bg-gray-100 border-gray-300';
    if (daysUntil === 0) return 'bg-red-50 border-red-300';
    if (daysUntil <= 3) return 'bg-orange-50 border-orange-300';
    return 'bg-blue-50 border-blue-300';
  };

  const getApplicationName = (applicationId: number): string => {
    if (!Array.isArray(applications) || applications.length === 0) {
      return 'Unknown Application';
    }

    const app = applications.find(a => a.id === applicationId);
    if (!app) return 'Unknown Application';

    // ✅ Handle different company name formats
    const companyName = 
      app.job?.company
      'Unknown Company';

    const jobTitle = 
      app.job?.title
      'Unknown Position';

    return `${companyName} - ${jobTitle}`;
  };

  const sortedInterviews = [...interviews].sort((a, b) => {
    const dateA = new Date(`${a.date}T${(a as any).time || '00:00'}`);
    const dateB = new Date(`${b.date}T${(b as any).time || '00:00'}`);
    return dateA.getTime() - dateB.getTime();
  });

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Interview Scheduler</h2>
        </div>
        <button
          onClick={() => handleOpenForm()}
          disabled={operationLoading.create || appsLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Schedule Interview
        </button>
      </div>

      {/* Loading State */}
      {appsLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Interview List */}
      <div className="space-y-4">
        {sortedInterviews.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No interviews scheduled</p>
            <p className="text-sm text-gray-400 mt-1">
              Schedule your first interview to get started
            </p>
          </div>
        ) : (
          sortedInterviews.map((interview) => {
            const daysUntil = getDaysUntil(interview.date);
            
            // Handle prep checklist - ensure it's always an array
            let prepChecklist = [];
            const rawChecklist = (interview as any).prep_checklist || (interview as any).prepChecklist;
            
            if (typeof rawChecklist === 'string') {
              try {
                const parsed = JSON.parse(rawChecklist);
                if (Array.isArray(parsed)) {
                  prepChecklist = parsed.map((item: any) => ({
                    description: item.description || item.task || '',
                    completed: item.completed || false
                  }));
                } else {
                  prepChecklist = [];
                }
              } catch (e) {
                prepChecklist = [];
              }
            } else if (Array.isArray(rawChecklist)) {
              prepChecklist = rawChecklist.map((item: any) => ({
                description: item.description || item.task || '',
                completed: item.completed || false
              }));
            } else {
              prepChecklist = [];
            }

            // Count only valid tasks (not empty strings)
           // const completedTasks = prepChecklist.filter((t: any) => t.completed).length;
            const totalTasks = prepChecklist.filter((t: any) => 
              typeof t.description === 'string' && t.description.trim().length > 0
            ).length;

            const applicationId = (interview as any).application_id || (interview as any).applicationId;
            const applicationName = getApplicationName(applicationId);

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
                        {(interview as any).type || 'phone'}
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
                          ? 'Past'
                          : daysUntil === 0
                          ? 'Today!'
                          : `${daysUntil} days`}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {(interview as any).interviewer
                        ? `Interview with ${(interview as any).interviewer}`
                        : `Interview for ${applicationName}`}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">{applicationName}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenForm(interview)}
                      disabled={operationLoading.update}
                      className="p-2 text-gray-600 hover:bg-white rounded disabled:opacity-50"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(interview.id)}
                      disabled={operationLoading.delete}
                      className="p-2 text-red-600 hover:bg-white rounded disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(interview.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {(interview as any).time}
                  </div>
                  {(interview as any).location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {(interview as any).location}
                    </div>
                  )}
                  {(interview as any).notes && (
                    <p className="text-gray-600 italic mt-2">{(interview as any).notes}</p>
                  )}
                </div>

                {/* Prep Checklist */}
                {prepChecklist.length > 0 && (
                  <div className="bg-white bg-opacity-50 rounded p-3 space-y-2">
                    {/* ✅ Filter out invalid/empty tasks */}
                    {prepChecklist.filter(item => 
                      typeof item.description === 'string' && item.description.trim().length > 0
                    ).length > 0 ? (
                      <>
                        <p className="font-medium text-sm text-gray-700">
                          Prep Progress (
                          {prepChecklist.filter(item => 
                            typeof item.description === 'string' && item.description.trim().length > 0 && item.completed
                          ).length}
                          /
                          {prepChecklist.filter(item => 
                            typeof item.description === 'string' && item.description.trim().length > 0
                          ).length}
                          )
                        </p>
                        <div className="space-y-1">
                          {prepChecklist
                            .filter(item => 
                              typeof item.description === 'string' && item.description.trim().length > 0
                            )
                            .map((task: any, idx: number) => (
                              <label
                                key={idx}
                                className="flex items-center gap-2 cursor-pointer text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={task.completed || false}
                                  onChange={() => handleTogglePrepTask(interview.id, idx)}
                                  disabled={operationLoading.update}
                                  className="w-4 h-4 rounded"
                                />
                                <span className={task.completed ? 'line-through text-gray-500' : ''}>
                                  {task.description}
                                </span>
                              </label>
                            ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">No valid preparation tasks</p>
                    )}
                  </div>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm === interview.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800 mb-2">
                      Are you sure you want to delete this interview?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(interview.id)}
                        disabled={operationLoading.delete}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                      >
                        {operationLoading.delete ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingInterview ? 'Edit Interview' : 'Schedule New Interview'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-gray-100 rounded"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Application Selector */}
              <ApplicationSelector
                value={formData.applicationId}
                onChange={(id) => setFormData({ ...formData, applicationId: id })}
                required
                error={formData.applicationId === 0 ? 'Application is required' : undefined}
                applications={applications}
              />

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'phone' | 'video' | 'in-person' })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="phone">Phone</option>
                  <option value="video">Video Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>

              {/* Interviewer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interviewer Name
                </label>
                <input
                  type="text"
                  value={formData.interviewer}
                  onChange={(e) =>
                    setFormData({ ...formData, interviewer: e.target.value })
                  }
                  placeholder="e.g., John Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location / Meeting Link
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Zoom link or office address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this interview..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Prep Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Preparation Checklist
                  </label>
                  <button
                    type="button"
                    onClick={addPrepChecklistItem}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.prepChecklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.task}
                        onChange={(e) => updatePrepChecklistItem(idx, e.target.value)}
                        placeholder="e.g., Review job description"
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removePrepChecklistItem(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={operationLoading.create || operationLoading.update}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {operationLoading.create || operationLoading.update ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {editingInterview ? 'Updating...' : 'Scheduling...'}
                    </span>
                  ) : editingInterview ? (
                    'Update Interview'
                  ) : (
                    'Schedule Interview'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};