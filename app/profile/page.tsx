'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import Navigation from '@/components/Navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faCalendar, faFutbol, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useFirebaseAuth();
  const router = useRouter();
  const [gamesBooked, setGamesBooked] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

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
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.displayName}</h2>
              <p className="text-gray-600">{user.email}</p>
              {user.isAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  <FontAwesomeIcon icon={faShieldHalved} className="mr-1 w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
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
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faFutbol} className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Account Status</p>
                <p className="text-xl font-semibold text-green-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
