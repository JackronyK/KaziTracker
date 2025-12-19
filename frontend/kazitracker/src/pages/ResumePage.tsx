// src/pages/ResumePage.tsx

/**
 * ResumesPage Component
 * Main page for resume management
 */

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useResumes } from "../hooks/useResumes";
import type { Resume } from "../types";
import { logInfo } from "../utils/errorLogger";

import { ResumeUploader } from '../components/Resume/ResumeUploader';
import { ResumeList } from '../components/Resume/ResumeList';
import { ResumeFilters } from '../components/Resume/ResumeFilters';
import { ResumeDetail } from '../components/Resume/ResumeDetail';
import { DeleteResumeModal } from '../components/Resume/DeleteResumeModal';

/**
 * ResumesPage Component
 * 
 * Features:
 * - Drag-drop file upload
 * - Resume list display
 * - Search and filter
 * - Tag management
 * - File details
 * - Delete with confirmation
 * - Loading & error states
 */

export const ResumesPage = () => {
    // Hooks
    const {
        resumes,
        loading,
        error,
        uploadResume,
        fetchResumes,
        updateResumeTags,
        deleteResume,        
    } = useResumes ();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [detailResume, setDetailResume] = useState<Resume | null>(null);
    const [deleteResume_, setDeleteResume] = useState<Resume | null>(null);
    const [localError, setLocalError] = useState('');

    // Fetch resumes on mount
    useEffect(() => {
        logInfo('ResumesPAges mounted - fetching resumes');
        fetchResumes();
    }, [fetchResumes]);

    // Get all unique tags
    const allTags = Array.from(
        new Set(resumes.flatMap((r) => r.tags || []))
    ).sort();


  // Filter resumes
  const filteredResumes = resumes.filter((resume) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      resume.original_filename.toLowerCase().includes(searchQuery.toLowerCase());

    // Tag filter
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => resume.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

  // Handle upload
  const handleUpload = async (file: File): Promise<boolean> => {
    logInfo('Uploading resume', { fileName: file.name });
    const success = await uploadResume(file);
    if (success) {
      await fetchResumes();
    }
    return success;
  };

  // Handle tags change
  const handleTagsChange = async (id: number, tags: string[]) => {
    logInfo('Updating resume tags', { resumeId: id, tagCount: tags.length });
    const success = await updateResumeTags(id, tags);
    if (success) {
      await fetchResumes();
      if (detailResume && detailResume.id === id) {
        setDetailResume({ ...detailResume, tags });
      }
    } else {
      setLocalError('Failed to update tags');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteResume_) return;

    logInfo('Deleting resume', { resumeId: deleteResume_.id });
    const success = await deleteResume(deleteResume_.id);

    if (success) {
      setLocalError('');
      logInfo('Resume deleted successfully');
      setDeleteResume(null);
      await fetchResumes();
    } else {
      setLocalError('Failed to delete resume');
    }
  };

  // Toggle tag filter
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Get stats
  const stats = {
    total: resumes.length,
    pdf: resumes.filter((r) => r.file_type.includes('pdf')).length,
    doc: resumes.filter((r) => r.file_type.includes('word') || r.file_type.includes('document')).length,
    tags: allTags.length,
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
        <div className="p-4 sm:p-6 lg:p-8">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Resumes</h1>
                    <p className="text-gray-600 mt-1">
                        Manage your resume file ({resumes.length} uploaded)
                    </p>
                </div>
            </div>


            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">📄 PDF</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pdf}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">📝 Word</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.doc}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">🏷️ Tags</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.tags}</p>
                </div>
            </div>

            {/* Error Message */}
            {(error || localError) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">
                    ⚠️ {error || localError}
                    </p>
                    <button
                    onClick={() => setLocalError('')}
                    className="text-red-600 hover:text-red-700 text-xs mt-2"
                    >
                    Dismiss
                    </button>
                </div>
            )}

            {/* Upload Area */}
            <ResumeUploader onUpload={handleUpload} isLoading={loading} />

            {/* Filters */}
            <ResumeFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            allTags={allTags}
            />


        {/* Resumes List or Empty State */}
            {loading ? (
            <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading resumes...</p>
            </div>

            ) : filteredResumes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg font-medium">
                {resumes.length === 0
                    ? 'No resumes yet'
                    : 'No resumes match your filter'}
                </p>
                <p className="text-gray-500 mt-2">
                {resumes.length === 0
                    ? 'Upload your first resume to get started'
                    : 'Try adjusting your search or filters'}
                </p>
            </div>
            ) : (
            <ResumeList
                resumes={filteredResumes}
                onDelete={(id) => {
                const resume = resumes.find((r) => r.id === id);
                if (resume) setDeleteResume(resume);
                }}
                onTagsChange={handleTagsChange}
            />
            )}
        </div>

      {/* Resume Detail Modal */}
      {detailResume && (
        <ResumeDetail
          resume={detailResume}
          onClose={() => setDetailResume(null)}
          onTagsChange={(tags) => handleTagsChange(detailResume.id, tags)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteResume_ && (
        <DeleteResumeModal
          resume={deleteResume_}
          onConfirm={handleDelete}
          onCancel={() => setDeleteResume(null)}
          isLoading={loading}
        />
      )}
    </div>
  )
};

export default ResumesPage;