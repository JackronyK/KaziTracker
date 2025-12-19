// src/components/Resume/ResumeList.tsx
/**
 * ResumeList Component
 * Displays list of resumes in responsive grid
 */

import type { Resume } from '../../types';
import { ResumeCard } from './ResumeCard';

interface ResumeListProps {
  resumes: Resume[];
  onDelete: (id: number) => void;
  onTagsChange: (id: number, tags: string[]) => void;
}

/**
 * ResumeList Component
 * 
 * Props:
 * - resumes: Array of Resume objects
 * - onDelete: Callback when delete clicked
 * - onTagsChange: Callback when tags updated
 * 
 * Features:
 * - Responsive grid layout
 * - Resume cards with thumbnails
 * - Edit and delete buttons
 */
export const ResumeList = ({
  resumes,
  onDelete,
  onTagsChange,
}: ResumeListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
          onDelete={onDelete}
          onTagsChange={onTagsChange}
        />
      ))}
    </div>
  );
};

export default ResumeList;