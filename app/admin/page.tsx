'use client';

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import GameManager from '@/components/admin/GameManager';
import AnnouncementManager from '@/components/admin/AnnouncementManager';
import PhotoManager from '@/components/admin/PhotoManager';

export default function AdminPage() {
  const { user, isAuthenticated, loading } = useFirebaseAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'games' | 'announcements' | 'photos'>('games');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && !user?.isAdmin) {
      router.push('/');
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo.png"
                alt="Play for Peace"
                width={32}
                height={32}
                className="hidden sm:block"
              />
              <h1 className="text-xl font-bold text-primary-600">Admin Panel</h1>
              <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {user.displayName}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('games')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'games'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Games
              </button>
              <button
                onClick={() => setActiveTab('announcements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'announcements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Announcements
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'photos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Photo Gallery
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'games' && <GameManager />}
        {activeTab === 'announcements' && <AnnouncementManager />}
        {activeTab === 'photos' && <PhotoManager />}
      </main>
    </div>
  );
}
