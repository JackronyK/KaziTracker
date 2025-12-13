import { useState, useEffect } from 'react';
import { Briefcase, LogOut, Plus } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface Job {
  id: number;
  title: string;
  company: string;
  location?: string;
  salary_range?: string;
  apply_url?: string;
  created_at: string;
}

interface User {
  email: string;
}

// =============================================================================
// APP COMPONENT
// =============================================================================

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Check if user is logged in
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchJobs();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setJobs([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Briefcase className="w-12 h-12 mx-auto text-blue-600 mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={(token) => {
      localStorage.setItem('token', token);
      fetchCurrentUser();
      fetchJobs();
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">JobAppTracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">{user.email}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Action bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Applications</h2>
            <p className="text-gray-600 mt-1">{jobs.length} jobs tracked</p>
          </div>
          <button
            onClick={() => setShowAddJobModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Job
          </button>
        </div>

        {/* Jobs grid */}
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No jobs tracked yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showAddJobModal && (
        <AddJobModal
          onClose={() => setShowAddJobModal(false)}
          onJobAdded={() => {
            fetchJobs();
            setShowAddJobModal(false);
          }}
          token={token}
        />
      )}
    </div>
  );
}

// =============================================================================
// LOGIN PAGE
// =============================================================================

function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
    try {
      const res = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.access_token);
      } else {
        setError(data.detail || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">JobAppTracker</h1>
          <p className="text-gray-600 mt-2">Track your job search in one place</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// JOB CARD
// =============================================================================

function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition">
      <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
      <p className="text-blue-600 font-medium">{job.company}</p>
      {job.location && <p className="text-gray-600 text-sm">{job.location}</p>}
      {job.salary_range && <p className="text-green-600 font-medium text-sm mt-2">{job.salary_range}</p>}
      <div className="mt-4 flex gap-2">
        {job.apply_url && (
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            Apply →
          </a>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// ADD JOB MODAL
// =============================================================================

function AddJobModal({
  onClose,
  onJobAdded,
  token,
}: {
  onClose: () => void;
  onJobAdded: () => void;
  token: string | null;
}) {
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<any>(null);

  const handlePaste = async () => {
    if (!jdText.trim()) {
      setError('Please paste a job description');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // TODO: Call parser endpoint to extract fields
      // For now, simple mock parsing
      setParsed({
        title: 'Software Engineer',
        company: 'Tech Company',
        location: 'Remote',
        salary_range: '$100k - $150k',
        description: jdText,
        apply_url: '',
      });
    } catch (err) {
      setError('Failed to parse JD');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parsed) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        onJobAdded();
      } else {
        setError('Failed to save job');
      }
    } catch (err) {
      setError('Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Job</h2>

          {!parsed ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paste Job Description</label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the full job posting here..."
                  className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                onClick={handlePaste}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Parsing...' : 'Parse Job Description'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={parsed.title}
                  onChange={(e) => setParsed({ ...parsed, title: e.target.value })}
                  placeholder="Job Title"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={parsed.company}
                  onChange={(e) => setParsed({ ...parsed, company: e.target.value })}
                  placeholder="Company"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={parsed.location}
                  onChange={(e) => setParsed({ ...parsed, location: e.target.value })}
                  placeholder="Location"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={parsed.salary_range}
                  onChange={(e) => setParsed({ ...parsed, salary_range: e.target.value })}
                  placeholder="Salary Range"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <input
                type="text"
                value={parsed.apply_url}
                onChange={(e) => setParsed({ ...parsed, apply_url: e.target.value })}
                placeholder="Apply URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setParsed(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Job'}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}