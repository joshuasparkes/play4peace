'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faCamera, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import Link from 'next/link';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import Image from 'next/image';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const { signUp, signInWithGoogle, refreshUser, isAuthenticated, loading: authLoading } = useFirebaseAuth();
  const router = useRouter();

  // Redirect to home when authenticated (but not while loading/uploading photo)
  useEffect(() => {
    if (!authLoading && isAuthenticated && !loading) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, loading, router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Trim whitespace from email
    const trimmedEmail = email.trim();

    // Validate email format
    if (!trimmedEmail) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate display name
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // console.log('🔵 Starting sign up process...');
      // console.log('Display Name:', displayName);
      // console.log('Has Photo:', !!photoFile);

      // First create the account (without photo)
      // console.log('🔵 Creating account...');
      await signUp(trimmedEmail, password, displayName.trim());
      // console.log('✅ Account created');

      // Then upload photo if one was selected (now user is authenticated)
      if (photoFile) {
        // console.log('🔵 Uploading photo...');
        try {
          const timestamp = Date.now();
          const fileName = `signup_${timestamp}_${photoFile.name}`;
          const storageRef = ref(storage, `profile-photos/${fileName}`);

          // console.log('🔵 Uploading to storage...');
          await uploadBytes(storageRef, photoFile);
          const photoURL = await getDownloadURL(storageRef);
          // console.log('✅ Photo uploaded:', photoURL);

          // Update the profile with photo URL
          const { auth } = await import('@/lib/firebase');
          const { updateProfile } = await import('firebase/auth');
          const { updateUser } = await import('@/lib/firestore');

          // console.log('🔵 Current user:', auth.currentUser?.uid);
          // console.log('🔵 Current user displayName:', auth.currentUser?.displayName);

          if (auth.currentUser) {
            // Update Firestore first, then Firebase Auth
            // This ensures when onAuthStateChanged fires, Firestore has the photo
            // console.log('🔵 Updating Firestore...');
            await updateUser(auth.currentUser.uid, { photoURL });
            // console.log('✅ Firestore updated');

            // console.log('🔵 Updating Firebase Auth profile...');
            await updateProfile(auth.currentUser, { photoURL });
            // console.log('✅ Firebase Auth updated');

            // console.log('🔵 Final auth state - displayName:', auth.currentUser.displayName);
            // console.log('🔵 Final auth state - photoURL:', auth.currentUser.photoURL);
          }
        } catch (photoErr) {
          // console.error('❌ Error uploading photo:', photoErr);
          setError('Account created, but photo upload failed. You can add a photo from your profile page.');
        }
      }

      // console.log('🔵 Refreshing user context with latest data...');
      // Force refresh of auth context with updated data from Firestore
      await refreshUser();
      // console.log('✅ User context refreshed');

      // console.log('🔵 Waiting for context to update...');
      // Wait a moment for auth context to update, then allow redirect
      setTimeout(() => {
        // console.log('✅ Sign up complete, allowing redirect');
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      // console.error('❌ Sign up error:', err);
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      // Reset loading to allow redirect
      setLoading(false);
    } catch (err: any) {
      setError('Failed to sign in with Google');
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join Play4Peace
          </h1>
          <p className="text-gray-600">
            Create your account to start playing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faUser} className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="text"
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-800"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faCamera} className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-800 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
            {photoPreview && (
              <div className="mt-3 flex items-center gap-3">
                <Image
                  src={photoPreview}
                  alt="Preview"
                  width={60}
                  height={60}
                  className="w-15 h-15 rounded-full object-cover border-2 border-purple-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Photo selected</p>
                  <p className="text-xs text-gray-600">This will be your profile photo</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-gray-800 ${
                  emailTouched && email
                    ? validateEmail(email.trim())
                      ? 'border-green-300 focus:ring-green-500'
                      : 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
                required
              />
            </div>
            {emailTouched && email && !validateEmail(email.trim()) && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3" />
                Please enter a valid email address
              </p>
            )}
            {emailTouched && email && validateEmail(email.trim()) && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                Valid email address
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faLock} className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-800"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faLock} className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition text-gray-800"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-full transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-full transition duration-200 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <FontAwesomeIcon icon={faGoogle} className="text-xl" />
          {loading ? 'Signing In...' : 'Sign up with Google'}
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
