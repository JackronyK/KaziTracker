// src/components/Resume/ResumeFilters.tsx
/**
 * ResumeFilters Component
 * Search and filter controls for resumes
 */

import { Search, X } from 'lucide-react';

interface ResumeFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allTags: string[];
}

/**
 * ResumeFilters Component
 * 
 * Props:
 * - searchQuery: Current search query
 * - onSearchChange: Callback for search changes
 * - selectedTags: Currently selected filter tags
 * - onTagToggle: Callback to toggle tag filter
 * - allTags: All available tags
 * 
 * Features:
 * - Search by filename
 * - Filter by tags
 * - Multi-tag selection
 * - Clear filters button
 */
export const ResumeFilters = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagToggle,
  allTags,
}: ResumeFiltersProps) => {
  return (
    <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Resumes
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {(searchQuery || selectedTags.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              onSearchChange('');
              selectedTags.forEach((tag) => onTagToggle(tag));
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeFilters;