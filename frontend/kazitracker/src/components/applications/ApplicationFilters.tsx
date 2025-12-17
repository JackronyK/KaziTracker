// src/components/application/ApplicationFilters.tsx
/**
 * ApplicationFilters Component
 * Search, filter, and sort controls for applications
 */

import { Search } from 'lucide-react';

interface ApplicationFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

/**
 * ApplicationFilters Component
 * 
 * Props:
 * - searchQuery: Current search query
 * - onSearchChange: Callback for search changes
 * - statusFilter: Current status filter
 * - onStatusFilterChange: Callback for status changes
 * - sortBy: Current sort option
 * - onSortChange: Callback for sort changes
 * 
 * Features:
 * - Search by company or job title
 * - Filter by application status
 * - Sort options
 * - Clear filters button
 */
export const ApplicationFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
}: ApplicationFiltersProps) => {
  const statuses = ['All Statuses', 'Saved', 'Applied', 'Interview', 'Offer', 'Rejected'];
  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'status', label: 'By Status' },
  ];

  return (
    <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Applications
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company or job..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Info */}
      {(searchQuery || statusFilter !== 'All Statuses' || sortBy !== 'date-desc') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Filters active: {searchQuery && `Search: "${searchQuery}"`}
            {statusFilter !== 'All Statuses' && ` • Status: ${statusFilter}`}
            {sortBy !== 'date-desc' &&
              ` • Sorted: ${sortOptions.find((o) => o.value === sortBy)?.label}`}
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              onStatusFilterChange('All Statuses');
              onSortChange('date-desc');
            }}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationFilters;