// src/components/applications/ApplicationCard.tsx
import { Calendar, MapPin, Building2, FileText, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Application } from '../../types/index';

interface ApplicationCardProps {
  application: Application;
  onStatusChange: (app: Application) => void;
  onDelete: (id: number) => void;
}

export const ApplicationCard = ({
  application,
  onStatusChange,
  onDelete,
}: ApplicationCardProps) => {
  
  /**
   * Get status border color - LEFT SIDE BAR COLOR
   */
  const getStatusBorderColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'saved':
        return 'border-l-gray-400';
      case 'applied':
        return 'border-l-blue-500';
      case 'interview':
        return 'border-l-purple-500';
      case 'offer':
        return 'border-l-green-500';
      case 'rejected':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-400';
    }
  };

  /**
   * Extract company name safely from multiple possible sources
   */
  const getCompanyName = (): string => {
    // Check if job object exists and has company info
    if (application.job) {
      // Try different possible company name fields
      return application.job.company ||
            //application.job.company?.name || 
             //application.job.companyName ||               
             (application.job as any)?.company_name || 
             'Unknown Company';
    }
    
    // If no job object, check if company info is directly on application
    return (application as any)?.company_name || 
            //application.company?.name || 
          // application.companyName ||            
           (application as any)?.company || 
           'Unknown Company';
  };

  /**
   * Extract job title safely from multiple possible sources
   */
  const getJobTitle = (): string => {
    // Check if job object exists and has title info
    if (application.job) {
      // Try different possible title fields
      return application.job.title || 
             //application.job.job_title || 
             (application.job as any)?.position || 
             'Unknown Position';
    }
    
    // If no job object, check if title info is directly on application
    return  (application as any)?.title || 
            //application.job_title ||           
           (application as any)?.position || 
           'Unknown Position';
  };

  /**
   * Extract job location safely
   */
  const getJobLocation = (): string | undefined => {
    if (application.job) {
      return application.job.location || 
             (application.job as any)?.job_location || 
             (application.job as any)?.work_location;
    }
    return  (application as any)?.job_location || 
           // application.location ||           
           (application as any)?.work_location;
  };

  /**
   * Format date to readable format
   */
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Not set';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  /**
   * Parse offer details safely
   */
  /**
  const parseOfferDetails = () => {
    if (!application.offer_date) return null; // Use offer_date instead of offer_details
    try {
      return JSON.parse(application.offer_date);
    } catch {
      return null;
    }
  };
  */

  const statusBorderColor = getStatusBorderColor(application.status);
  const companyName = getCompanyName();
  const jobTitle = getJobTitle();
  const jobLocation = getJobLocation();

  return (
    <div
      className={`bg-white rounded-lg border-l-4 ${statusBorderColor} border-r border-t border-b border-gray-200 hover:shadow-lg transition-shadow duration-200`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {jobTitle}
              </h3>
              <StatusBadge status={application.status} size="sm" />
            </div>
            
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{companyName}</span>
              </div>
              
              {jobLocation && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{jobLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => onStatusChange(application)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Update Status"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(application.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Delete Application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Applied Date */}
          {application.applied_date && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Applied</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(application.applied_date)}
                </p>
              </div>
            </div>
          )}

          {/* Interview Date */}
          {application.interview_date && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-purple-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Interview</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(application.interview_date)}
                </p>
              </div>
            </div>
          )}

          {/* Offer Date */}
          {application.offer_date && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-green-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Offer</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(application.offer_date)}
                </p>
              </div>
            </div>
          )}

          {/* Rejected Date */}
          {application.rejected_date && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Rejected</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(application.rejected_date)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Resume Info */}
        {application.resume && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-3">
            <FileText className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700 font-medium">
              Resume: {application.resume.filename}
            </span>
          </div>
        )}

        {/* Offer Details */}
        {application.status.toLowerCase() === 'offer' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
            <p className="text-sm font-semibold text-green-900 mb-1">
              🎉 Offer Details
            </p>
            {application.salary_offered && (
              <p className="text-sm text-green-800">
                <span className="font-medium">Salary:</span> {application.salary_offered}
              </p>
            )}
            {application.offer_date && (
              <p className="text-sm text-green-800">
                <span className="font-medium">Offer Date:</span> {formatDate(application.offer_date)}
              </p>
            )}
          </div>
        )}

        {/* Rejection Reason */}
        {application.status.toLowerCase() === 'rejected' && application.reason_for_rejection && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-900 mb-1">
              Rejection Reason
            </p>
            <p className="text-sm text-red-800">{application.reason_for_rejection}</p>
          </div>
        )}

        {/* Notes */}
        {application.notes && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-1">Notes</p>
            <p className="text-sm text-blue-800">{application.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;