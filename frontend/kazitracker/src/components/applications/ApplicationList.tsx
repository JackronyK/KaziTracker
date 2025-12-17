// src/components/application/applicationList
/**
 * ApplicationList Component
 * Displays list of applications in responsive grid
 */

import type { Application } from '../../types/index';
import { ApplicationCard } from './ApplicationCard';

interface ApplicationListProps {
  applications: Application[];
  onStatusChange: (app: Application) => void;
  onDelete: (id: number) => void;
}

/**
 * ApplicationList Component
 * 
 * Props:
 * - applications: Array of Application objects
 * - onStatusChange: Callback when status update clicked
 * - onDelete: Callback when delete clicked
 * 
 * Features:
 * - Responsive grid layout
 * - Application cards with status
 * - Edit and delete buttons
 */
export const ApplicationList = ({
  applications,
  onStatusChange,
  onDelete,
}: ApplicationListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.map((app) => (
        <ApplicationCard
          key={app.id}
          application={app}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ApplicationList;