// src/components/Layout/SettingsModal.tsx

import { Settings as SettingsIcon, Sun, Moon, Monitor, Bell } from 'lucide-react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { logInfo, logError } from '../../utils/errorLogger';

interface SettingsModalProps {
  onClose: () => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
}

export const SettingsModal = ({ onClose, isDarkMode = false, onThemeToggle = () => {} }: SettingsModalProps) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(isDarkMode ? 'dark' : 'light');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    if (newTheme !== 'auto') {
      onThemeToggle();
    }
    logInfo('Theme changed', { theme: newTheme });
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
            <SettingsIcon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-lg font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Settings
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
        <div className="p-6 space-y-6">
          {/* Theme Settings */}
          <div>
            <label className={`block text-sm font-semibold mb-3 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              🎨 Appearance Theme
            </label>
            <div className="space-y-2">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'auto', label: 'Auto', icon: Monitor },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleThemeChange(id as 'light' | 'dark' | 'auto')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded border-2 transition ${
                    theme === id
                      ? `${isDarkMode ? 'border-blue-500 bg-blue-900/30' : 'border-blue-600 bg-blue-50'}`
                      : `${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className={`text-sm font-medium ${
                    theme === id
                      ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {label} Mode
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Language Settings */}
          <div>
            <label className={`block text-sm font-semibold mb-3 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              🌐 Language
            </label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                logInfo('Language changed', { language: e.target.value });
              }}
              className={`w-full px-4 py-2 rounded border outline-none text-sm transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
            </select>
          </div>

          {/* Notifications */}
          <div>
            <label className={`flex items-center gap-3 cursor-pointer ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => {
                  setNotifications(e.target.checked);
                  logInfo('Notifications toggled', { enabled: e.target.checked });
                }}
                className="w-4 h-4 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">Enable Notifications</span>
              </div>
            </label>
            <p className={`text-xs mt-2 ml-6 transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Get alerts for interviews, offers, and deadlines
            </p>
          </div>

          {/* Info */}
          <div className={`p-3 rounded text-sm transition-colors ${
            isDarkMode
              ? 'bg-gray-700 text-gray-300'
              : 'bg-gray-100 text-gray-700'
          }`}>
            <p className="font-medium mb-1">💡 Pro Tip</p>
            <p>Dark mode is easier on your eyes during long job search sessions!</p>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t transition-colors ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};