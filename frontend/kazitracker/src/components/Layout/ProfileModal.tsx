// src/components/Layout/ProfileModal.tsx

import { X, User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { User as UserType } from '../../types';
import { apiClient } from '../../api';
import { logInfo, logError } from '../../utils/errorLogger';

interface ProfileModalProps {
  user: UserType | null;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const ProfileModal = ({ user, onClose, isDarkMode = false }: ProfileModalProps) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [headline, setHeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone_number || '');
      setLocation(user.location || '');
      setHeadline(user.headline || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!fullName.trim()) {
        setError('Full name is required');
        return;
      }

      await apiClient.updateProfile({
        full_name: fullName,
        phone_number: phoneNumber,
        location,
        headline,
      });

      setSuccess('Profile updated successfully!');
      logInfo('Profile updated', { fullName });
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      logError('Profile update failed', err as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg shadow-xl max-w-md w-full transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <User className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-lg font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Edit Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded transition ${
              isDarkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className={`p-3 rounded text-sm transition-colors ${
              isDarkMode
                ? 'bg-red-900/30 text-red-300'
                : 'bg-red-50 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {success && (
            <div className={`p-3 rounded text-sm transition-colors ${
              isDarkMode
                ? 'bg-green-900/30 text-green-300'
                : 'bg-green-50 text-green-700'
            }`}>
              {success}
            </div>
          )}

          {/* Email (Read-only) */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email
            </label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-500'
            }`}>
              <Mail className="w-4 h-4" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className={`bg-transparent outline-none text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Full Name
            </label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700 focus-within:border-blue-500'
                : 'border-gray-300 focus-within:border-blue-500'
            }`}>
              <User className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                disabled={loading}
                className={`bg-transparent outline-none text-sm w-full transition-colors ${
                  isDarkMode ? 'text-white placeholder-gray-500' : ''
                }`}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Phone
            </label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700 focus-within:border-blue-500'
                : 'border-gray-300 focus-within:border-blue-500'
            }`}>
              <Phone className="w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                disabled={loading}
                className={`bg-transparent outline-none text-sm w-full transition-colors ${
                  isDarkMode ? 'text-white placeholder-gray-500' : ''
                }`}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Location
            </label>
            <div className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700 focus-within:border-blue-500'
                : 'border-gray-300 focus-within:border-blue-500'
            }`}>
              <MapPin className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                disabled={loading}
                className={`bg-transparent outline-none text-sm w-full transition-colors ${
                  isDarkMode ? 'text-white placeholder-gray-500' : ''
                }`}
              />
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Professional Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., Full Stack Developer"
              disabled={loading}
              className={`w-full px-3 py-2 rounded border outline-none text-sm transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded font-medium transition ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};