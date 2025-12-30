// src/pages/ProfilePage.tsx
/**
 * ProfilePage Component
 * Allows users to complete their profile information
 * 
 * Phase 1: Basic info (full name, contact, location)
 * Future: Education, skills, projects for resume generation
 */

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '../api';
import { logInfo, logError } from '../utils/errorLogger';
import type { User as UserType } from '../types';

interface ProfilePageProps {
  user: UserType | null;
  onComplete?: () => void;
}

/**
 * ProfilePage Component
 * 
 * Allows users to:
 * - Add full name
 * - Add email (read-only from auth)
 * - Add phone number
 * - Add location
 * - Add professional headline
 * 
 * Future expansions:
 * - Education history
 * - Skills
 * - Work experience
 * - Projects
 * - Resume generation
 */
export const ProfilePage = ({ user, onComplete }: ProfilePageProps) => {
  // Form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [headline, setHeadline] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load existing profile data
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone_number || '');
      setLocation(user.location || '');
      setHeadline(user.headline || '');
    }
  }, [user]);

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters');
      return false;
    }

    if (phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(phoneNumber)) {
      setError('Please enter a valid phone number');
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
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      logInfo('Updating user profile', {
        fullName,
        location,
      });

      // Call API to update profile
      // Note: You'll need to add this endpoint to your backend
      const response = await apiClient.updateProfile({
        full_name: fullName,
        phone_number: phoneNumber,
        location,
        headline,
      });

      setSuccessMessage('Profile updated successfully!');
      logInfo('Profile updated successfully', { fullName });

      // Reset editing mode
      setIsEditing(false);

      // Call completion callback if provided
      if (onComplete) {
        setTimeout(() => onComplete(), 1500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      logError('Profile update failed', err as Error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if profile is complete
   */
  const isProfileComplete = fullName && (phoneNumber || location);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 text-lg">
            Help us personalize your job search experience
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Profile Completion</p>
            <p className="text-sm font-bold text-blue-600">
              {fullName ? '50%' : '0%'}
            </p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
              style={{ width: fullName ? '50%' : '0%' }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Profile' : 'Your Information'}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {isEditing
                ? 'Update your profile information'
                : 'Review your profile information'}
            </p>
          </div>

          {/* Card Body */}
          <div className="p-8">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-700">{successMessage}</p>
                  <p className="text-sm text-green-600 mt-1">
                    You can now start tracking your job applications!
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Form / View Mode */}
            {isEditing ? (
              // Edit Mode
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">This cannot be changed</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Professional Headline */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g., Full Stack Developer | 5+ years experience"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">This helps customize your job recommendations</p>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              // View Mode
              <div className="space-y-4">
                {/* Email Display */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-medium">Email</p>
                    <p className="text-gray-900 font-semibold">{user?.email}</p>
                  </div>
                </div>

                {/* Full Name Display */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 font-medium">Full Name</p>
                    <p className="text-gray-900 font-semibold">
                      {fullName || <span className="text-gray-400">Not provided</span>}
                    </p>
                  </div>
                </div>

                {/* Phone Display */}
                {phoneNumber && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-medium">Phone</p>
                      <p className="text-gray-900 font-semibold">{phoneNumber}</p>
                    </div>
                  </div>
                )}

                {/* Location Display */}
                {location && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 font-medium">Location</p>
                      <p className="text-gray-900 font-semibold">{location}</p>
                    </div>
                  </div>
                )}

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  Edit Profile
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Card Footer */}
          {!successMessage && (
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">💡 Tip:</span> Complete your profile to get personalized job recommendations
              </p>
            </div>
          )}
        </div>

        {/* Future Features Notice */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-2">🚀 Coming Soon:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Education history & certifications</li>
            <li>✓ Skills & expertise</li>
            <li>✓ Work experience</li>
            <li>✓ Auto-generated resume from profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;