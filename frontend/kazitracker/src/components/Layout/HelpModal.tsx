// ============================================================================
// HELP MODAL
// ============================================================================

import { X } from 'lucide-react';
import { logInfo, logError } from '../../utils/errorLogger';

interface HelpModalProps {
  onClose: () => void;
  isDarkMode?: boolean;
}

export const HelpModal = ({ onClose, isDarkMode = false }: HelpModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto transition-colors ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b sticky top-0 transition-colors ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">❓</span>
            <h2 className={`text-lg font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Help & Support
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
          {/* FAQ Section */}
          <div>
            <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              {[
                { q: "How do I track applications?", a: "Go to Applications > New Application to start tracking" },
                { q: "Can I upload multiple resumes?", a: "Yes! Upload as many resumes as you need in the Resumes section" },
                { q: "How do I use Premium Hub?", a: "Access interviews, offers, and deadlines tracking in the Premium Hub" },
                { q: "Can I export my data?", a: "Contact support for data export requests" },
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded transition-colors ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {item.q}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className={`p-4 rounded-lg transition-colors ${
            isDarkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'
          }`}>
            <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
              📧 Contact Support
            </h4>
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
              Need more help? Reach out to our support team
            </p>
            <a
              href="mailto:support@kazitracker.com"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition"
            >
              Email Support
            </a>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <a href="#" onClick={(e) => { e.preventDefault(); logInfo('Documentation clicked'); }} 
               className={`block text-sm font-medium transition ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              📚 Documentation
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); logInfo('Roadmap clicked'); }} 
               className={`block text-sm font-medium transition ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              🗺️ Roadmap
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); logInfo('Feedback clicked'); }} 
               className={`block text-sm font-medium transition ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
              💬 Send Feedback
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t transition-colors ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};