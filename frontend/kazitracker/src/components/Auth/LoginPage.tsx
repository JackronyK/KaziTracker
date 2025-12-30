// src/components/Auth/LoginPage.tsx
/**
 * Enhanced LoginPage Component
 * Production-ready authentication with security features
 * 
 * Features:
 * - Password strength meter
 * - Password confirmation on signup
 * - Email validation
 * - Strong password requirements
 * - Comprehensive error handling
 */

import { useState } from 'react';
import { Briefcase, Eye, EyeOff, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/index';
import { logError, logInfo } from '../../utils/errorLogger';

interface LoginPageProps {
  onLoginSuccess: (token: string) => void;
}

/**
 * Password strength validation
 */
interface PasswordStrength {
  score: number; // 0-5
  feedback: string[];
  isStrong: boolean;
}

const validatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('At least 8 characters');
  }

  if (password.length >= 12) {
    score++;
  }

  // Uppercase
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('One uppercase letter');
  }

  // Lowercase
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('One lowercase letter');
  }

  // Numbers
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('One number');
  }

  // Special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push('One special character (!@#$%^&*)');
  }

  return {
    score: Math.min(score, 5),
    feedback: feedback.length > 0 ? feedback : ['Strong password!'],
    isStrong: score >= 4,
  };
};

/**
 * Get password strength color and label
 */
const getStrengthColor = (score: number): { color: string; label: string } => {
  switch (score) {
    case 0:
    case 1:
      return { color: 'bg-red-500', label: 'Weak' };
    case 2:
      return { color: 'bg-orange-500', label: 'Fair' };
    case 3:
      return { color: 'bg-yellow-500', label: 'Good' };
    case 4:
      return { color: 'bg-lime-500', label: 'Strong' };
    case 5:
      return { color: 'bg-green-500', label: 'Very Strong' };
    default:
      return { color: 'bg-gray-300', label: 'Unknown' };
  }
};

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength
  const passwordStrength = validatePasswordStrength(password);
  const strengthColor = getStrengthColor(passwordStrength.score);

  /**
   * Validate signup form
   */
  const validateSignupForm = (): boolean => {
    // Email validation
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('All fields are required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Password strength
    if (!passwordStrength.isStrong) {
      setError(
        `Password is not strong enough. Please add: ${passwordStrength.feedback.join(', ')}`
      );
      return false;
    }

    return true;
  };

  /**
   * Validate login form
   */
  const validateLoginForm = (): boolean => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Validate based on mode
      const isValid = isSignup ? validateSignupForm() : validateLoginForm();
      if (!isValid) {
        setLoading(false);
        return;
      }

      logInfo('Authentication attempt', {
        email,
        action: isSignup ? 'signup' : 'login',
      });

      // Call API
      const response = isSignup
        ? await apiClient.signup(email, password)
        : await apiClient.login(email, password);

      // Store token
      apiClient.setToken(response.access_token);
      localStorage.setItem('token', response.access_token);

      // Success message
      const message = isSignup
        ? 'Account created successfully! Completing your profile...'
        : 'Logged in successfully!';
      setSuccessMessage(message);
      logInfo('Authentication successful', {
        email,
        action: isSignup ? 'signup' : 'login',
      });

      // Callback to parent
      onLoginSuccess(response.access_token);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
      logError('Authentication failed', err as Error, {
        email,
        action: isSignup ? 'signup' : 'login',
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
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
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
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
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

              {/* Password Strength Meter (Signup only) */}
              {isSignup && password && (
                <div className="mt-3 space-y-2">
                  {/* Strength Bar */}
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded-full transition ${
                          i < passwordStrength.score ? strengthColor.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Strength Label */}
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium text-gray-600">
                      Strength: <span className={`${strengthColor.color.replace('bg-', 'text-')}`}>
                        {strengthColor.label}
                      </span>
                    </p>
                  </div>

                  {/* Requirements Feedback */}
                  {!passwordStrength.isStrong && (
                    <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-2 rounded">
                      {passwordStrength.feedback.map((item, i) => (
                        <p key={i} className="flex items-center gap-1">
                          <span className="text-red-500">•</span> Add {item}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Password Confirmation Field (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600 font-medium">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (isSignup && !passwordStrength.isStrong) || (isSignup && password !== confirmPassword)}
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
            <p>Password: StrongPass123!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;