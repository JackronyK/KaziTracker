// src/components/Resume/ResumeTagManager.tsx
/**
 * ResumeTagManager Component
 * Manage tags for individual resumes
 */

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface ResumeTagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestedTags?: string[];
}

/**
 * ResumeTagManager Component
 * 
 * Props:
 * - tags: Current tags
 * - onTagsChange: Callback when tags change
 * - suggestedTags: Optional suggested tags
 * 
 * Features:
 * - Add new tags
 * - Remove existing tags
 * - Suggested tags
 * - Tag validation
 * - Real-time updates
 */
export const ResumeTagManager = ({
  tags,
  onTagsChange,
  suggestedTags = [
    'Senior',
    'Mid-Level',
    'Junior',
    'Backend',
    'Frontend',
    'Full-Stack',
    '2024',
    '2025',
  ],
}: ResumeTagManagerProps) => {
  const [newTag, setNewTag] = useState('');

  // Add tag
  const handleAddTag = () => {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
      setNewTag('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove));
  };

  // Add suggested tag
  const handleAddSuggested = (tag: string) => {
    if (!tags.includes(tag.toLowerCase())) {
      onTagsChange([...tags, tag.toLowerCase()]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Tags */}
      {tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Current Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-blue-600 hover:text-blue-900 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Tag */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Add New Tag
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Type tag name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Tags */}
      {suggestedTags.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Suggested Tags</p>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleAddSuggested(tag)}
                disabled={tags.includes(tag.toLowerCase())}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  tags.includes(tag.toLowerCase())
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeTagManager;