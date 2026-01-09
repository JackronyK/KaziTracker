// ============================================================================
// DEADLINE TRACKER - WITH APPLICATION SELECTOR
// ============================================================================
import { AlertCircle, Plus, Edit2, Trash2, X } from 'lucide-react';
import { apiClient } from '../../api/index';
import type { Deadline } from '../../types/Premium';
import type { UseDeadlinesReturn } from '../../hooks/useDeadlines';
import type { useToast } from '../../hooks/useToast';
import { useState, useEffect } from 'react';
import type { Application } from '../../types/index'
import { ApplicationSelector } from '../ui/ApplicationSelector';

interface DeadlineTrackerProps extends UseDeadlinesReturn {
  toast: ReturnType<typeof useToast>;
}

export const DeadlineTracker = ({
  deadlines,
  operationLoading,
  addDeadline,
  updateDeadline,
  deleteDeadline,
  toggleDeadlineComplete,
  toast,
}: DeadlineTrackerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await apiClient.listApplications();
        setApplications(data);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
      }
    };
    fetchApplications();
  }, []);

  const emptyForm = {
    applicationId: 0,
    title: '',
    dueDate: '',
    type: 'response' as 'response' | 'decision' | 'negotiation' | 'other',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  const handleOpenForm = (deadline?: Deadline) => {
    if (deadline) {
      setEditingDeadline(deadline);
      setFormData({
        applicationId: (deadline as any).application_id || (deadline as any).applicationId || 0,
        title: (deadline as any).title || '',
        dueDate: (deadline as any).dueDate || (deadline as any).due_date || '',
        type: (deadline as any).type || 'response',
        priority: (deadline as any).priority || 'medium',
        notes: (deadline as any).notes || '',
      });
    } else {
      setEditingDeadline(null);
      setFormData(emptyForm);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDeadline(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.applicationId === 0) {
      toast.error('Validation Error', 'Please select an application');
      return;
    }

    if (!formData.title || !formData.dueDate) {
      toast.error('Validation Error', 'Title and due date are required');
      return;
    }

    if (editingDeadline) {
      const result = await updateDeadline(editingDeadline.id, formData as any);
      if (result) {
        toast.success('Deadline Updated', 'Your deadline has been updated');
        handleCloseForm();
      }
    } else {
      const result = await addDeadline(formData as any);
      if (result) {
        toast.success('Deadline Added', 'Your deadline has been added');
        handleCloseForm();
      }
    }
  };

  const handleDelete = async (id: number) => {
    const result = await deleteDeadline(id);
    if (result) {
      toast.success('Deadline Deleted', 'Deadline has been removed');
      setShowDeleteConfirm(null);
    }
  };

  const handleToggleComplete = async (id: number) => {
    await toggleDeadlineComplete(id);
  };

  const getDaysUntil = (date: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(date);
    deadline.setHours(0, 0, 0, 0);
    const diff = deadline.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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

  const getApplicationName = (applicationId: number): string => {
    if (!Array.isArray(applications) || applications.length === 0) {
      return 'Unknown Application';
    }

    const app = applications.find(a => a.id === applicationId);
    if (!app) return 'Unknown Application';

    // ✅ Handle different company name formats
    const companyName = 
      app.company_name ||           // Nested: company.name
      //app.companyName ||              // Flat: companyName
      //(app as any).company_name ||    // Snake case: company_name
      'Unknown Company';

    const jobTitle = 
      app.job_title || 
      //(app as any).position || 
      'Unknown Position';

    return `${companyName} - ${jobTitle}`;
  };

  const sortedDeadlines = [...deadlines].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const daysA = getDaysUntil((a as any).dueDate ?? (a as any).due_date);
    const daysB = getDaysUntil((b as any).dueDate ?? (b as any).due_date);
    return daysA - daysB;
  });

  const stats = {
    total: deadlines.length,
    completed: deadlines.filter((d) => d.completed).length,
    urgent: deadlines.filter((d) => !d.completed && getDaysUntil((d as any).dueDate ?? (d as any).due_date) <= 2).length,
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Deadline Tracker</h2>
        </div>
        <button
          onClick={() => handleOpenForm()}
          disabled={operationLoading.create}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Deadline
        </button>
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
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No deadlines</p>
            <p className="text-sm text-gray-400 mt-1">Add a deadline to get started</p>
          </div>
        ) : (
          sortedDeadlines.map((deadline) => {
            const daysUntil = getDaysUntil((deadline as any).dueDate ?? (deadline as any).due_date);
            const applicationId = (deadline as any).application_id || (deadline as any).applicationId;
            const applicationName = getApplicationName(applicationId);

            return (
              <div
                key={deadline.id}
                className={`border-l-4 p-4 rounded-lg flex items-center gap-4 transition ${getUrgencyColor(
                  daysUntil,
                  deadline.completed
                )}`}
              >
                <input
                  type="checkbox"
                  checked={deadline.completed}
                  onChange={() => handleToggleComplete(deadline.id)}
                  disabled={operationLoading.update}
                  className="w-5 h-5 rounded cursor-pointer disabled:opacity-50"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{getDeadlineIcon((deadline as any).type)}</span>
                    <h3
                      className={`font-semibold ${
                        deadline.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {(deadline as any).title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{applicationName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date((deadline as any).dueDate ?? (deadline as any).due_date).toLocaleDateString()} •{' '}
                    <span className={getUrgencyBadge(daysUntil, deadline.completed)}>
                      {daysUntil < 0
                        ? 'Overdue'
                        : daysUntil === 0
                        ? 'Due Today!'
                        : `${daysUntil} days left`}
                    </span>
                  </p>
                  {(deadline as any).notes && (
                    <p className="text-xs text-gray-500 mt-1">{(deadline as any).notes}</p>
                  )}
                </div>

                <span
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    (deadline as any).priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : (deadline as any).priority === 'medium'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {((deadline as any).priority || 'medium').charAt(0).toUpperCase() +
                    ((deadline as any).priority || 'medium').slice(1)}
                </span>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenForm(deadline)}
                    disabled={operationLoading.update}
                    className="p-2 text-gray-600 hover:bg-white rounded disabled:opacity-50"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(deadline.id)}
                    disabled={operationLoading.delete}
                    className="p-2 text-red-600 hover:bg-white rounded disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {showDeleteConfirm === deadline.id && (
                  <div className="absolute right-4 mt-2 p-3 bg-red-50 border border-red-200 rounded shadow-lg z-10">
                    <p className="text-sm text-red-800 mb-2">Delete this deadline?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(deadline.id)}
                        disabled={operationLoading.delete}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                      >
                        Yes
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
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingDeadline ? 'Edit Deadline' : 'Add New Deadline'}
              </h3>
              <button onClick={handleCloseForm} className="p-2 hover:bg-gray-100 rounded">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Respond to job offer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="response">Response</option>
                    <option value="decision">Decision</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={operationLoading.create || operationLoading.update}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
                >
                  {operationLoading.create || operationLoading.update
                    ? editingDeadline
                      ? 'Updating...'
                      : 'Adding...'
                    : editingDeadline
                    ? 'Update Deadline'
                    : 'Add Deadline'}
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