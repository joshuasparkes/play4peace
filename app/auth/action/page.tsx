'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

function AuthActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleEmailVerification = async () => {
      const mode = searchParams.get('mode');
      const actionCode = searchParams.get('oobCode');

      if (!actionCode) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      // Handle email verification
      if (mode === 'verifyEmail') {
        try {
          await applyActionCode(auth, actionCode);
          setStatus('success');
          setMessage('Email verified successfully!');

          // Redirect to home page after 2 seconds
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } catch (error: any) {
          console.error('Error verifying email:', error);
          setStatus('error');

          if (error.code === 'auth/invalid-action-code') {
            setMessage('This verification link has expired or already been used');
          } else {
            setMessage('Failed to verify email. Please try again.');
          }
        }
      } else {
        setStatus('error');
        setMessage('Invalid action type');
      }
    };

    handleEmailVerification();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Play4Peace"
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>

          <div className="mb-6">
            {status === 'loading' && (
              <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 text-purple-600 animate-spin" />
            )}
            {status === 'success' && (
              <FontAwesomeIcon icon={faCheckCircle} className="w-12 h-12 text-green-600" />
            )}
            {status === 'error' && (
              <FontAwesomeIcon icon={faTimesCircle} className="w-12 h-12 text-red-600" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Redirecting you to the app...
            </p>
          )}

          {status === 'error' && (
            <button
              onClick={() => router.push('/login')}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-full transition duration-200"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50">
          <div className="text-center">
            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-purple-600 animate-spin" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthActionContent />
    </Suspense>
  );
}
