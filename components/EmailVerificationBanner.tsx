'use client';

import { useState } from 'react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export default function EmailVerificationBanner() {
  const { emailVerified, isAuthenticated, resendVerificationEmail, refreshUser } = useFirebaseAuth();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  // Don't show if authenticated and verified, or if dismissed, or not authenticated
  if (!isAuthenticated || emailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setResending(true);
    setError('');
    setResent(false);

    try {
      await resendVerificationEmail();
      setResent(true);
      // Auto-hide success message after 5 seconds
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    await refreshUser();
  };

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-800">
                Please verify your email address
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Check your inbox for a verification link. You may need to check your spam folder.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {resent && (
              <div className="flex items-center gap-1.5 text-green-700 text-sm">
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                <span className="hidden sm:inline">Email sent!</span>
              </div>
            )}
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            <button
              onClick={handleResend}
              disabled={resending || resent}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {resending ? 'Sending...' : resent ? 'Sent!' : 'Resend Email'}
            </button>
            <button
              onClick={handleCheckVerification}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 text-yellow-800 text-sm font-medium rounded border border-yellow-300 transition whitespace-nowrap"
            >
              I've Verified
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 text-yellow-600 hover:text-yellow-800 transition"
              aria-label="Dismiss"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
