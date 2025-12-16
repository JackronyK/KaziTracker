import { useState, useEffect } from 'react';
import { Briefcase, LogOut, Plus, Trash2, CheckCircle2, AlertCircle, ArrowRight, Search } from 'lucide-react';
import { apiClient } from './api';
import type { Job, User, ParsedJD } from './api'; // Use type imports for interfaces


// =============================================================================
// MAIN APP COMPONENT
// =============================================================================
// This is the root component that shows either login or dashboard
// React renders this component and updates it when state changes

export default function App() {
  // =========================================================================
  // STATE MANAGEMENT (useState hook)
  // =========================================================================
  // State is data that can change. When it changes, React re-renders the UI
  
  const [user, setUser] = useState<User | null>(null);
  // user: Current logged-in user or null
  // setUser: Function to update user state
  
  const [jobs, setJobs] = useState<Job[]>([]);
  // jobs: Array of all user's jobs
  // setJobs: Function to update jobs list
  
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  // showAddJobModal: Boolean to show/hide the "Add Job" dialog
  
  const [loading, setLoading] = useState(true);
  // loading: Shows loading spinner while fetching data
  
  const [error, setError] = useState('');
  // error: Error message to display to user
  
  const [searchQuery, setSearchQuery] = useState('');
  // searchQuery: Text user types in search box

  // Get token from browser storage
  const token = localStorage.getItem('token');

  // =========================================================================
  // USEEFFECT HOOK (Run code when component loads)
  // =========================================================================
  // This runs once when app starts to fetch user and jobs
  
  useEffect(() => {
    if (token) {
      // Token exists, so user is logged in
      apiClient.setToken(token);
      fetchCurrentUser();
      fetchJobs();
    } else {
      // No token, user needs to log in
      setLoading(false);
    }
  }, [token]); // [token] means: run this when token changes

  // =========================================================================
  // FETCH FUNCTIONS (Get data from backend)
  // =========================================================================
  
  const fetchCurrentUser = async () => {
    try {
      // async/await: Wait for API response
      const token = localStorage.getItem('token');
      if (token) {
        apiClient.setToken(token);
      }
      const data = await apiClient.getCurrentUser();
      setUser(data); // Update state with user data
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('token');
      apiClient.clearToken();
      setUser(null);
    } finally {
      // Finally runs regardless of success or error
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await apiClient.listJobs();
      setJobs(data); // Update state with jobs
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load jobs');
    }
  };

  // =========================================================================
  // EVENT HANDLERS (Functions called on user actions)
  // =========================================================================
  
  const handleLogout = () => {
    // Remove token and reset state
    localStorage.removeItem('token');
    apiClient.clearToken();
    setUser(null);
    setJobs([]);
  };

  const handleDeleteJob = async (id: number) => {
    // Ask user to confirm before deleting
    if (!confirm('Delete this position?')) return;
    
    try {
      await apiClient.deleteJob(id);
      // Remove job from list by filtering it out
      setJobs(jobs.filter(j => j.id !== id));
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  // =========================================================================
  // FILTERED JOBS (Search functionality)
  // =========================================================================
  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // =========================================================================
  // RENDER: LOADING STATE
  // =========================================================================
  // Show loading spinner while fetching data
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading KaziTracker...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: LOGIN OR DASHBOARD
  // =========================================================================
  // If user not logged in, show login page. Otherwise show dashboard
  
  if (!user) {
    return <LoginPage onLogin={(token) => {
      apiClient.setToken(token);
      localStorage.setItem('token', token);
      fetchCurrentUser();
      fetchJobs();
    }} />;
  }

  // =========================================================================
  // RENDER: DASHBOARD
  // =========================================================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">KaziTracker</h1>
                <p className="text-sm text-gray-500">Professional job tracking</p>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                <p className="text-xs text-gray-500">{jobs.length} position{jobs.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ERROR BANNER */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-700 font-bold text-xl"
            >
              ✕
            </button>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">My Applications</h2>
          <p className="text-gray-600">
            {jobs.length === 0 
              ? 'Start tracking your job search' 
              : `You're tracking ${jobs.length} opportunity${jobs.length !== 1 ? 'ies' : ''}`}
          </p>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by position or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowAddJobModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Position
          </button>
        </div>

        {/* JOBS GRID */}
        {filteredJobs.length === 0 ? (
          // Empty State
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">
              {searchQuery ? 'No positions match your search' : 'No positions tracked yet'}
            </p>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'Try a different search' : 'Paste a job description to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddJobModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Your First Position
              </button>
            )}
          </div>
        ) : (
          // Jobs Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onDelete={() => handleDeleteJob(job.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
      {showAddJobModal && (
        <AddJobModal
          onClose={() => setShowAddJobModal(false)}
          onJobAdded={() => {
            fetchJobs();
            setShowAddJobModal(false);
          }}
        />
      )}
    </div>
  );
}

// =============================================================================
// LOGIN PAGE COMPONENT
// =============================================================================
// This component handles user authentication (signup/login)

function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);
    setError('');

    try {
      // Call signup or login API
      const response = isSignup
        ? await apiClient.signup(email, password)
        : await apiClient.login(email, password);
      
      // Store token and proceed
      apiClient.setToken(response.access_token);
      localStorage.setItem('token', response.access_token);
      onLogin(response.access_token);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">KaziTracker</h1>
          <p className="text-gray-600 mt-3">Manage your job search effortlessly</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : isSignup ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Signup/Login */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="w-full text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            {isSignup 
              ? '✓ Already have an account? Sign in' 
              : 'New user? Create an account'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// JOB CARD COMPONENT
// =============================================================================
// This component displays a single job position

function JobCard({ job, onDelete }: { job: Job; onDelete: () => void }) {
  const skills = job.parsed_skills 
    ? job.parsed_skills.split(',').map(s => s.trim()).filter(s => s) 
    : [];
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
          <p className="text-blue-600 font-semibold text-sm mt-1">{job.company}</p>
        </div>
        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition duration-200"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Location */}
      {job.location && (
        <p className="text-gray-600 text-sm mb-2">📍 {job.location}</p>
      )}

      {/* Salary */}
      {job.salary_range && (
        <p className="text-green-600 font-semibold text-sm mb-3">💰 {job.salary_range}</p>
      )}

      {/* Seniority Badge */}
      {job.seniority_level && (
        <div className="mb-3">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            job.seniority_level === 'senior' ? 'bg-purple-100 text-purple-700' :
            job.seniority_level === 'mid' ? 'bg-blue-100 text-blue-700' :
            'bg-green-100 text-green-700'
          }`}>
            {job.seniority_level.charAt(0).toUpperCase() + job.seniority_level.slice(1)} Level
          </span>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Required Skills</p>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="text-xs bg-slate-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="text-xs bg-slate-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                +{skills.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Apply Button */}
      {job.apply_url && (
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-700 mt-4 group/link"
        >
          Apply Now
          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition" />
        </a>
      )}

      {/* Date Added */}
      <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
        Added {new Date(job.created_at).toLocaleDateString()}
      </p>
    </div>
  );
}

// =============================================================================
// ADD JOB MODAL COMPONENT
// =============================================================================
// Modal dialog for adding new job positions

function AddJobModal({
  onClose,
  onJobAdded,
}: {
  onClose: () => void;
  onJobAdded: () => void;
}) {
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<ParsedJD | null>(null);
  const [parsedLoading, setParsedLoading] = useState(false);

  const handleParse = async () => {
    if (!jdText.trim()) {
      setError('Please paste a job description');
      return;
    }

    setParsedLoading(true);
    setError('');
    try {
      const result = await apiClient.parseJD(jdText);
      setParsed(result);
    } catch (err: any) {
      setError(err.message || 'Failed to parse job description');
    } finally {
      setParsedLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parsed) return;
    
    setLoading(true);
    try {
      await apiClient.createJob({
        title: parsed.title,
        company: parsed.company,
        location: parsed.location,
        salary_range: parsed.salary_range,
        description: parsed.description,
        apply_url: parsed.apply_url,
        parsed_skills: parsed.skills.join(', '),
        seniority_level: parsed.seniority_level,
        source: 'parsed_jd',
      });
      onJobAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Position</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!parsed ? (
            // Step 1: Paste JD
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paste Job Description
                </label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Copy and paste the full job posting here..."
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleParse}
                disabled={parsedLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {parsedLoading ? '⏳ Parsing...' : '🔍 Parse Job Description'}
              </button>
            </div>
          ) : (
            // Step 2: Review & Save
            <div className="space-y-4">
              {/* Success Banner */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Parsed successfully!</p>
                  <p className="text-sm text-green-700">Confidence: {(parsed.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Position Title</label>
                  <input
                    type="text"
                    value={parsed.title}
                    onChange={(e) => setParsed({ ...parsed, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={parsed.company}
                    onChange={(e) => setParsed({ ...parsed, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={parsed.location || ''}
                    onChange={(e) => setParsed({ ...parsed, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={parsed.salary_range || ''}
                    onChange={(e) => setParsed({ ...parsed, salary_range: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Apply URL</label>
                <input
                  type="url"
                  value={parsed.apply_url || ''}
                  onChange={(e) => setParsed({ ...parsed, apply_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {parsed.skills.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Detected Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {parsed.skills.map((skill, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setParsed(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? '💾 Saving...' : '✓ Save Position'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}