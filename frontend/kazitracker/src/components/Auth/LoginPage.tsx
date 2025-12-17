// src/components/auth/LoginPage.tsx
/**
 * LoginPage Component
 * User authentication page with signup/login toggle
 * Updated for Phase 2 layout integration
 */

import { useState } from 'react';
import { Briefcase, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { apiClient } from '../../api';
import { logError, logInfo } from '../../utils/errorLogger';

interface LoginPageProps {
  onLoginSuccess: (token: string) => void;
}

/**
 * LoginPage Component
 * 
 * Features:
 * - Email/password authentication
 * - Signup/login toggle
 * - Password visibility toggle
 * - Comprehensive error handling
 * - Professional UI design
 * 
 * Usage:
 * <LoginPage onLoginSuccess={handleLoginSuccess} />
 */
export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Handle form submission (signup or login)
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Validate inputs
      if (!email.trim() || !password.trim()) {
        throw new Error('Email and password are required');
      }

      if (email.length < 5 || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Call API
      logInfo('Authentication attempt', { 
        email, 
        action: isSignup ? 'signup' : 'login' 
      });

      const response = isSignup
        ? await apiClient.signup(email, password)
        : await apiClient.login(email, password);

      // Store token
      apiClient.setToken(response.access_token);
      localStorage.setItem('token', response.access_token);

      // Success message
      const message = isSignup
        ? 'Account created successfully!'
        : 'Logged in successfully!';
      setSuccessMessage(message);
      logInfo('Authentication successful', { email, action: isSignup ? 'signup' : 'login' });

      // Callback to parent
      onLoginSuccess(response.access_token);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      logError('Authentication failed', err as Error, { 
        email, 
        action: isSignup ? 'signup' : 'login' 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle between signup and login
   */
  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setSuccessMessage('');
    logInfo('Auth mode toggled', { mode: isSignup ? 'login' : 'signup' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo & Branding */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">KaziTracker</h1>
            <p className="text-gray-600 font-medium">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {isSignup
                ? 'Start tracking your job applications'
                : 'Continue your job search'}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">✓ {successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">⚠️ {error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : isSignup ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <p className="text-xs text-gray-500 font-medium">OR</p>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Toggle Auth Mode */}
          <button
            onClick={toggleAuthMode}
            disabled={loading}
            className="w-full text-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition disabled:opacity-50"
          >
            {isSignup ? (
              <>
                Already have an account?
                <span className="text-blue-600 ml-1">Sign In</span>
              </>
            ) : (
              <>
                Don't have an account?
                <span className="text-blue-600 ml-1">Sign Up</span>
              </>
            )}
          </button>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-6">
            By {isSignup ? 'signing up' : 'signing in'}, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Credentials Hint (Development Only) */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-white/20 rounded-lg text-white text-xs">
            <p className="font-semibold mb-2">💡 Dev Hint:</p>
            <p>Email: test@example.com</p>
            <p>Password: password123</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;