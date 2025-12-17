// src/components/jobs/JobList.tsx


/**
 * JobList Component
 * Displays list of jobs in a responsive grid
 */

import type { Job } from '../../types/index';
import { JobCard } from './JobCard';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: number) => void;
}

/**
 * JobList Component
 * 
 * Props:
 * - jobs: Array of Job objects to display
 * - onEdit: Callback when edit button clicked
 * - onDelete: Callback when delete button clicked
 * 
 * Features:
 * - Responsive grid layout (1 col mobile, 2 cols tablet, 3 cols desktop)
 * - Job cards with all details
 * - Edit and delete buttons
 */
export const JobList = ({ jobs, onEdit, onDelete }: JobListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default JobList;