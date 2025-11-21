'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

export default function VerifyEmailPage() {
  const { emailVerified, isAuthenticated, loading: authLoading, resendVerificationEmail, refreshUser, logout } = useFirebaseAuth();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Redirect to home if already verified
  useEffect(() => {
    if (!authLoading && isAuthenticated && emailVerified) {
      router.push('/');
    }
  }, [emailVerified, isAuthenticated, authLoading, router]);

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
    setChecking(true);
    setError('');

    try {
      await refreshUser();
      // Give a moment for state to update
      setTimeout(() => {
        setChecking(false);
      }, 1000);
    } catch (err: any) {
      setError('Failed to check verification status');
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Play4Peace"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <FontAwesomeIcon icon={faEnvelope} className="text-purple-600 text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a verification email to your inbox
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Check your email</strong>
          </p>
          <p className="text-sm text-blue-700">
            Click the verification link in the email we sent you. You may need to check your spam folder.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {resent && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
            Verification email sent! Check your inbox.
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={checking}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-full transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4" />
                I've Verified My Email
              </>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={resending || resent}
            className="w-full bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-3 px-4 rounded-full transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? 'Sending...' : resent ? 'Email Sent!' : 'Resend Verification Email'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-full transition duration-200"
          >
            Log Out
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the email?
          </p>
          <ul className="mt-2 text-xs text-gray-500 text-left space-y-1 max-w-xs mx-auto">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure you entered the correct email</li>
            <li>• Wait a few minutes and try resending</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
