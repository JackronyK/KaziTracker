// src/components/ui/ApplicationSelector.tsx
import { useState, useEffect, useCallback } from 'react';
import { Briefcase, Search, AlertTriangle } from 'lucide-react';
import type { Application } from '../../types';

// ✅ FIXED: Handle both flat and nested company structures
interface ApplicationSelectorProps {
  value: string | number;
  onChange: (applicationId: number) => void;
  required?: boolean;
  error?: string;
  applications?: Application[];
  onApplicationsLoaded?: (apps: Application[]) => void;
}

export const ApplicationSelector = ({
  value,
  onChange,
  required = false,
  error,
  applications: propApplications,
  onApplicationsLoaded,
}: ApplicationSelectorProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // ✅ Helper function to extract company name from various formats
  const getCompanyName = (app: Application): string => {
    // Try nested company.name first
    if (app.job?.company) {
      return app.job.company;
    }
  /*  
    // Try flat companyName
    if (app.companyName) {
      return app.companyName;
    }
    // Try snake_case company_name
    if (app.company_name) {
      return app.company_name;
    } */
    return 'Unknown Company';
  };

  // ✅ Helper function to extract position/job title
  const getJobTitle = (app: Application): string => {
    return app.job?.title || 'Unknown Position';
  };

  // Handle application data loading
  const loadApplications = useCallback(async () => {
    if (!propApplications) return;
    
    setLoading(true);
    setFetchError(null);
    setDebugInfo(null);

    try {
      // Validate the data is actually an array
      if (!Array.isArray(propApplications)) {
        throw new Error(`Applications data is not an array. Received: ${typeof propApplications}`);
      }

      // ✅ Log first application to debug structure
      if (propApplications.length > 0) {
        console.log('First application structure:', propApplications[0]);
        setDebugInfo(`Loaded ${propApplications.length} applications. First app: ${JSON.stringify(propApplications[0])}`);
      }

      setApplications(propApplications);
      onApplicationsLoaded?.(propApplications);
    } catch (err) {
      console.error('Failed to load applications:', err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to load applications - unknown error';
      
      setFetchError(errorMessage);
      setApplications([]);
      setDebugInfo(`Error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  }, [propApplications, onApplicationsLoaded]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // ✅ Safely filter applications with proper company name extraction
  const filteredApplications = Array.isArray(applications) 
    ? applications.filter((app) => {
        const searchLower = searchTerm.toLowerCase().trim();
        if (!searchLower) return true;
        
        const companyName = getCompanyName(app).toLowerCase();
        const jobTitle = getJobTitle(app).toLowerCase();
        const status = (app.status || '').toLowerCase();
        
        return (
          companyName.includes(searchLower) ||
          jobTitle.includes(searchLower) ||
          status.includes(searchLower)
        );
      })
    : [];

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Application {required && <span className="text-red-500">*</span>}
      </label>

      {/* Debug info in development */}
      {debugInfo  && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded mb-2 max-h-20 overflow-auto">
          Debug: {debugInfo}
        </div>
      )}

      {/* Search input for many applications */}
      {applications.length > 5 && (
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search applications..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Application dropdown */}
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        required={required}
        disabled={loading}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error || fetchError ? 'border-red-500' : 'border-gray-300'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value={0}>
          {loading 
            ? 'Loading applications...' 
            : fetchError 
              ? 'Error loading applications' 
              : applications.length === 0
                ? 'No applications available'
                : 'Select an application'}
        </option>
        {/* ✅ Use helper functions to extract company name and job title */}
        {filteredApplications.map((app) => (
          <option key={app.id} value={app.id}>
            {getCompanyName(app)} - {getJobTitle(app)} ({app.status || 'Unknown'})
          </option>
        ))}
      </select>

      {/* Error messages */}
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {error}
        </p>
      )}
      {fetchError && (
        <p className="mt-1 text-xs text-orange-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {fetchError}
        </p>
      )}

      {/* Empty state messaging */}
      {!loading && !fetchError && Array.isArray(applications) && applications.length === 0 && (
        <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
          <Briefcase className="w-3 h-3" />
          No applications found. Create an application first.
        </p>
      )}
    </div>
  );
};