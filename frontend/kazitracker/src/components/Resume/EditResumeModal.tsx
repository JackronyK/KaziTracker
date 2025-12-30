// src/components/Resume/EditResumeModal.tsx

import { useState, useEffect } from 'react';
import { X, Tag, Upload } from 'lucide-react';
import type { Resume } from '../../types';

interface EditResumeModalProps {
  resume: Resume;
  onClose: () => void;
  onSave: (tags: string, file?: File) => Promise<void>;  
  isLoading?: boolean; 
}

export const EditResumeModal = ({ resume, onClose, onSave }: EditResumeModalProps) => {
  const [tags, setTags] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTags(resume.tags || '');
  }, [resume]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSave(tags, newFile || undefined);
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Resume</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update tags and/or replace file
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current File Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-2">CURRENT FILE</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">{resume.file_type.toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{resume.filename}</p>
                <p className="text-sm text-gray-600">
                  Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Replace File (Optional)</span>
              </div>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {newFile ? newFile.name : 'Click to select or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOCX, or DOC</p>
              </label>
            </div>
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>Tags</span>
              </div>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., senior, fullstack, updated-2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">Separate tags with commas</p>
          </div>

          {/* Tags Preview */}
          {tagList.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview ({tagList.length} tags)
              </label>
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                {tagList.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditResumeModal;