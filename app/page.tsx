'use client';

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { getGames, toggleAttendance, seedInitialData, getUsersDisplayNames } from '@/lib/firestore';
import { Game } from '@/types';

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useFirebaseAuth();
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<{ [uid: string]: string }>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      initializeData();
    }
  }, [isAuthenticated, authLoading, router]);

  const initializeData = async () => {
    await seedInitialData();
    await loadGames();
  };

  const loadGames = async () => {
    try {
      const loadedGames = await getGames();
      setGames(loadedGames);

      // Fetch all attendee names
      const allAttendees = new Set<string>();
      loadedGames.forEach(game => {
        game.attendees.forEach(uid => allAttendees.add(uid));
      });

      if (allAttendees.size > 0) {
        const names = await getUsersDisplayNames(Array.from(allAttendees));
        setUserNames(names);
      }
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (gameId: string) => {
    if (user?.uid) {
      try {
        await toggleAttendance(gameId, user.uid);
        await loadGames();
      } catch (error) {
        console.error('Error toggling attendance:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Games</h1>
          <p className="text-gray-600 mt-2">Book your spot for upcoming matches</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading games...</p>
          </div>
        ) : games.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No upcoming games scheduled yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => {
              const isUserAttending = game.attendees.includes(user?.uid || '');
              const spotsLeft = game.maxPlayers - game.attendees.length;

              return (
                <div key={game.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="bg-gradient-to-r from-primary-500 to-blue-500 h-2"></div>

                  <Link href={`/games/${game.id}`} className="block p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatDate(game.date)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {game.time} • {game.location}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Players</span>
                        <span className="font-semibold text-gray-900">
                          {game.attendees.length} / {game.maxPlayers}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${(game.attendees.length / game.maxPlayers) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Game is full'}
                      </p>
                    </div>

                    {/* {game.attendees.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-2">Confirmed players:</p>
                        <div className="flex flex-wrap gap-2">
                          {game.attendees.slice(0, 5).map((attendeeUid, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-primary-800"
                            >
                              {userNames[attendeeUid] || 'Loading...'}
                            </span>
                          ))}
                          {game.attendees.length > 5 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{game.attendees.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )} */}

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="py-2 px-4 rounded-full font-semibold bg-white-500 hover:bg-purple-200 text-purple-700 pointer-cursor text-center">
                          View Details
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleAttendance(game.id);
                        }}
                        disabled={!isUserAttending && spotsLeft === 0}
                        className={`flex-1 py-2 px-4 rounded-full font-semibold transition duration-200 ${
                          isUserAttending
                            ? 'bg-white hover:bg-red-200 text-red-400'
                            : spotsLeft === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {isUserAttending ? 'Leave' : spotsLeft === 0 ? 'Full' : 'Join'}
                      </button>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
