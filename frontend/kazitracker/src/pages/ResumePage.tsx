// src/pages/ResumePage.tsx

/**
 * ResumesPage Component - PRODUCTION READY ✅
 * Complete resume management with view, edit (tags & file), download, and delete
 */

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useResumes } from "../hooks/useResumes";
import type { Resume } from "../types";
import { logInfo, logError } from "../utils/errorLogger";

// Components
import { ResumeUploader } from '../components/Resume/ResumeUploader';
import { ResumeList } from '../components/Resume/ResumeList';
import { ResumeFilters } from '../components/Resume/ResumeFilters';
import { ResumeDetail } from '../components/Resume/ResumeDetail';
import { DeleteResumeModal } from '../components/Resume/DeleteResumeModal';
import { EditResumeModal } from '../components/Resume/EditResumeModal';
import apiClient from "../api";

/**
 * ResumesPage Component
 * 
 * Features:
 * ✅ Drag-drop file upload
 * ✅ Resume list with proper filename display
 * ✅ View resume details
 * ✅ Edit resume (tags AND file replacement)
 * ✅ Download resume with auth token
 * ✅ Delete resume with confirmation
 * ✅ Search and filter by tags
 * ✅ Tag management
 * ✅ Loading & error states
 * ✅ Production-ready
 */
export const ResumesPage = () => {
  // =========================================================================
  // HOOKS
  // =========================================================================
  
  const {
    resumes,
    loading,
    error: hookError,
    uploadResume,
    fetchResumes,
    updateResumeTags,
    deleteResume,
  } = useResumes();

  // =========================================================================
  // STATE
  // =========================================================================
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [detailResume, setDetailResume] = useState<Resume | null>(null);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [deletingResume, setDeletingResume] = useState<Resume | null>(null);
  const [localError, setLocalError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // =========================================================================
  // LIFECYCLE
  // =========================================================================
  
  // Fetch resumes on mount
  useEffect(() => {
    logInfo('ResumesPage mounted - fetching resumes');
    fetchResumes();
  }, [fetchResumes]);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================
  
  // Get all unique tags from resumes
  const allTags = Array.from(
    new Set(
      resumes
        .flatMap((r) => r.tags?.split(',').map(t => t.trim()) || [])
        .filter(Boolean)
    )
  ).sort();

  // Filter resumes based on search and tag filters
  const filteredResumes = resumes.filter((resume) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      resume.filename.toLowerCase().includes(searchQuery.toLowerCase());

    // Tag filter
    const resumeTags = resume.tags?.split(',').map(t => t.trim()).filter(Boolean) || [];
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => resumeTags.includes(tag));

    return matchesSearch && matchesTags;
  });

  // Get statistics
  const stats = {
    total: resumes.length,
    pdf: resumes.filter((r) => r.file_type === 'pdf').length,
    docx: resumes.filter((r) => r.file_type === 'docx').length,
    tags: allTags.length,
  };

  // =========================================================================
  // HANDLERS
  // =========================================================================

  /**
   * Handle file upload
   * @param file - File to upload
   * @param tags - Optional tags to assign
   * @returns Success boolean
   */
  const handleUpload = async (file: File, tags?: string): Promise<boolean> => {
    logInfo('Uploading resume', { fileName: file.name });
    
    try {
      const result = await uploadResume(file, tags);
      
      if (result) {
        logInfo('Resume uploaded successfully');
        await fetchResumes();
        setLocalError('');
        return true;
      }
      
      setLocalError('Failed to upload resume');
      return false;
    } catch (err) {
      logError('Resume upload failed', err as Error);
      setLocalError('Failed to upload resume');
      return false;
    }
  };

  /**
   * Handle view resume details
   * @param resume - Resume to view
   */
  const handleView = (resume: Resume) => {
    logInfo('Opening resume details', { resumeId: resume.id });
    setDetailResume(resume);
  };

  /**
   * Handle edit resume - update tags and/or replace file
   * 
   * This is called from EditResumeModal with:
   * - tags: string of comma-separated tags
   * - file: optional File object if user selected a new file
   * 
   * IMPORTANT: We call apiClient.updateResume() which handles both
   */
  const handleEditSave = async (tags: string, file?: File) => {
    if (!editingResume) return;

    logInfo('Updating resume', { 
      resumeId: editingResume.id, 
      hasTags: !!tags, 
      hasFile: !!file 
    });

    setEditLoading(true);
    
    try {
      // This API call handles both tags AND file replacement
      await apiClient.updateResume(editingResume.id, tags, file);
      
      logInfo('Resume updated successfully');
      
      // Refresh the resumes list to show updated data
      await fetchResumes();
      
      // Close the modal
      setEditingResume(null);
      setDetailResume(null);
      setLocalError('');
      
    } catch (err) {
      logError('Resume update failed', err as Error);
      setLocalError('Failed to update resume. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  /**
   * Handle download resume
   * Opens file in new tab with proper authentication
   * 
   * @param resume - Resume to download
   */
  const handleDownload = async (resume: Resume) => {
    logInfo('Downloading resume', { 
      resumeId: resume.id, 
      filename: resume.filename 
    });
    
    try {
      // This method fetches with auth token and opens in new tab
      await apiClient.downloadResume(resume.id);
      logInfo('Resume download initiated');
    } catch (err) {
      logError('Resume download failed', err as Error);
      setLocalError('Failed to download resume');
    }
  };

  /**
   * Handle tags update (from ResumeDetail modal)
   * 
   * @param id - Resume ID
   * @param tags - Comma-separated tags string
   */
  const handleTagsChange = async (id: number, tags: string) => {
    logInfo('Updating resume tags', { resumeId: id });
    
    try {
      const success = await updateResumeTags(id, tags);
      
      if (success) {
        logInfo('Tags updated successfully');
        await fetchResumes();
        
        // Update detail modal if open
        if (detailResume && detailResume.id === id) {
          setDetailResume({ ...detailResume, tags });
        }
        
        setLocalError('');
      } else {
        setLocalError('Failed to update tags');
      }
    } catch (err) {
      logError('Tags update failed', err as Error);
      setLocalError('Failed to update tags');
    }
  };

  /**
   * Handle delete resume
   * Called after user confirms deletion
   */
  const handleDelete = async () => {
    if (!deletingResume) return;

    logInfo('Deleting resume', { resumeId: deletingResume.id });
    
    try {
      const success = await deleteResume(deletingResume.id);

      if (success) {
        logInfo('Resume deleted successfully');
        setLocalError('');
        setDeletingResume(null);
        await fetchResumes();
      } else {
        setLocalError('Failed to delete resume');
      }
    } catch (err) {
      logError('Resume deletion failed', err as Error);
      setLocalError('Failed to delete resume');
    }
  };

  /**
   * Toggle tag filter
   * @param tag - Tag to toggle
   */
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 sm:p-6 lg:p-8">
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resumes</h1>
            <p className="text-gray-600 mt-1">
              Manage your resume files ({resumes.length} uploaded)
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">📄 PDF</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pdf}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">📝 DOCX</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.docx}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium uppercase">🏷️ Tags</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.tags}</p>
          </div>
        </div>

        {/* Error Alert */}
        {(hookError || localError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ {hookError || localError}
            </p>
            <button
              onClick={() => setLocalError('')}
              className="text-red-600 hover:text-red-700 text-xs mt-2 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Section */}
        <ResumeUploader onUpload={handleUpload} isLoading={loading} />

        {/* Filters Section */}
        <ResumeFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          allTags={allTags}
        />

        {/* Resumes List or Empty State */}
        {loading && resumes.length === 0 ? (
          // Loading State
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading resumes...</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          // Empty State
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-medium">
              {resumes.length === 0
                ? 'No resumes yet'
                : 'No resumes match your filters'}
            </p>
            <p className="text-gray-500 mt-2">
              {resumes.length === 0
                ? 'Upload your first resume to get started'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          // Resumes List
          <ResumeList
            resumes={filteredResumes}
            onView={handleView}
            onEdit={(resume) => setEditingResume(resume)}
            onDownload={handleDownload}
            onDelete={(resume) => setDeletingResume(resume)}
            onTagsChange={handleTagsChange}
          />
        )}
      </div>

      {/* Modals */}

      {/* Resume Detail Modal */}
      {detailResume && (
        <ResumeDetail
          resume={detailResume}
          onClose={() => setDetailResume(null)}
          onEdit={() => {
            setEditingResume(detailResume);
            setDetailResume(null);
          }}
          onDownload={() => handleDownload(detailResume)}
          onTagsChange={(tags) => handleTagsChange(detailResume.id, tags)}
        />
      )}

      {/* Edit Resume Modal - WITH FILE UPLOAD */}
      {editingResume && (
        <EditResumeModal
          resume={editingResume}
          onClose={() => setEditingResume(null)}
          onSave={handleEditSave}  // Calls handler with both tags and file
          isLoading={editLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingResume && (
        <DeleteResumeModal
          resume={deletingResume}
          onConfirm={handleDelete}
          onCancel={() => setDeletingResume(null)}
          isLoading={loading}
        />
      )}
    </div>
  );
};

export default ResumesPage;