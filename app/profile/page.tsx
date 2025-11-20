'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import Navigation from '@/components/Navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faCalendar, faFutbol, faShieldHalved, faPencil } from '@fortawesome/free-solid-svg-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateUser } from '@/lib/firestore';
import { updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function ProfilePage() {
  const { user, firebaseUser, isAuthenticated, loading } = useFirebaseAuth();
  const router = useRouter();
  const [gamesBooked, setGamesBooked] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const loadUserStats = async () => {
      if (user) {
        // TODO: Count games where user is in attendees array
        // For now, just mock data
        setGamesBooked(0);
        setLoadingStats(false);
      }
    };

    loadUserStats();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleEditClick = () => {
    if (user) {
      setEditDisplayName(user.displayName);
      setEditEmail(user.email);
      setPassword('');
      setMessage('');
      setError('');
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPassword('');
    setMessage('');
    setError('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!firebaseUser || !user) return;

    setSaving(true);

    try {
      const emailChanged = editEmail !== user.email;

      if (emailChanged) {
        if (!password) {
          setError('Please enter your current password to change your email');
          setSaving(false);
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(firebaseUser, credential);
        await updateEmail(firebaseUser, editEmail);
      }

      if (editDisplayName !== user.displayName) {
        await updateProfile(firebaseUser, { displayName: editDisplayName });
      }

      const updates: any = {};
      if (editDisplayName !== user.displayName) updates.displayName = editDisplayName;
      if (emailChanged) updates.email = editEmail;

      if (Object.keys(updates).length > 0) {
        await updateUser(user.uid, updates);
      }

      setMessage('Profile updated successfully!');
      setPassword('');
      setTimeout(() => {
        setIsEditing(false);
        setMessage('');
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating profile:', err);

      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/requires-recent-login') {
        setError('Please log out and log back in to change your email.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use by another account.');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and view your stats</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {!isEditing ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    {user.isAdmin && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                        <FontAwesomeIcon icon={faShieldHalved} className="mr-1 w-3 h-3" />
                        Admin
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleEditClick}
                  className="flex items-center px-4 py-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition font-medium text-sm"
                >
                  <FontAwesomeIcon icon={faPencil} className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 text-gray-700">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-700">
                  <FontAwesomeIcon icon={faUser} className="text-gray-400 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Display Name</p>
                    <p className="font-medium">{user.displayName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-700">
                  <FontAwesomeIcon icon={faCalendar} className="text-gray-400 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-700">
                  <FontAwesomeIcon icon={faCalendar} className="text-gray-400 w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Active</p>
                    <p className="font-medium">{formatDate(user.lastActive)}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Profile</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="your@email.com"
                />
                {editEmail !== user?.email && (
                  <p className="text-xs text-gray-500 mt-1">
                    Changing your email will require your current password
                  </p>
                )}
              </div>

              {editEmail !== user?.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Enter your current password"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required to change your email address
                  </p>
                </div>
              )}

              {message && (
                <div className="bg-green-50 text-green-800 px-4 py-3 rounded-lg text-sm">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-full hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-full hover:bg-gray-300 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Games Booked</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingStats ? '...' : gamesBooked}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faFutbol} className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Account Status</p>
                <p className="text-xl font-semibold text-purple-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-purple-600 w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
