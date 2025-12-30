// src/components/Jobs/JobFilters
/**
 * JobFilters Component
 * Search and filter controls for jobs
 */

import { Search } from 'lucide-react';

interface JobFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  seniority: string;
  onSeniorityChange: (level: string) => void;
}

/**
 * JobFilters Component
 * 
 * Props:
 * - searchQuery: Current search query
 * - onSearchChange: Callback for search input changes
 * - seniority: Current seniority filter
 * - onSeniorityChange: Callback for seniority changes
 * 
 * Features:
 * - Search by job title or company
 * - Filter by seniority level
 * - Real-time filtering
 * - Responsive design
 */
export const JobFilters = ({
  searchQuery,
  onSearchChange,
  seniority,
  onSeniorityChange,
}: JobFiltersProps) => {
  return (
    <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Jobs
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or company..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Seniority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seniority Level
          </label>
          <select
            value={seniority}
            onChange={(e) => onSeniorityChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="Junior">Junior</option>
            <option value="Mid">Mid-Level</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
          </select>
        </div>
      </div>

      {/* Active Filters Info */}
      {(searchQuery || seniority !== 'all') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Filters active:{' '}
            {searchQuery && (
              <span className="font-medium">
                Search: "{searchQuery}"
                {seniority !== 'all' && ', '}
              </span>
            )}
            {seniority !== 'all' && (
              <span className="font-medium">Seniority: {seniority}</span>
            )}
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              onSeniorityChange('all');
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

export default JobFilters;