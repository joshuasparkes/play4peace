'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import Navigation from '@/components/Navigation';
import { getGame, toggleAttendance, getUsersProfiles } from '@/lib/firestore';
import { Game } from '@/types';
import FootballFormation from '@/components/FootballFormation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faClock, faLocationDot, faUsers, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function GameDetailsPage() {
  const { user, isAuthenticated, loading: authLoading } = useFirebaseAuth();
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<{ [uid: string]: { displayName: string; photoURL?: string } }>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && gameId) {
      loadGame();
    }
  }, [isAuthenticated, authLoading, gameId, router]);

  const loadGame = async () => {
    try {
      const loadedGame = await getGame(gameId);
      if (loadedGame) {
        setGame(loadedGame);

        // Fetch attendee profiles (names and photos)
        if (loadedGame.attendees.length > 0) {
          const profiles = await getUsersProfiles(loadedGame.attendees);
          setUserProfiles(profiles);
        }
      }
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async () => {
    if (user?.uid && game) {
      try {
        await toggleAttendance(game.id, user.uid);
        await loadGame();
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
      day: 'numeric',
    });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Game Not Found</h1>
            <button
              onClick={() => router.push('/')}
              className="text-primary-600 hover:text-primary-700"
            >
              Back to Games
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isUserAttending = user?.uid ? game.attendees.includes(user.uid) : false;
  const spotsLeft = game.maxPlayers - game.attendees.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          Back to Games
        </button>

        {/* Game Info Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Game Details</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">{formatDate(game.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Meet Time</p>
                <p className="font-semibold text-gray-900">{game.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faLocationDot} className="w-5 h-5 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">{game.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-primary-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Players</p>
                <p className="font-semibold text-gray-900">
                  {game.attendees.length} / {game.maxPlayers}
                </p>
                <p className="text-xs text-gray-500">
                  {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Game is full'}
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Button */}
          <button
            onClick={handleToggleAttendance}
            disabled={!isUserAttending && spotsLeft === 0}
            className={`w-full md:w-auto px-6 py-3 rounded-full font-semibold transition duration-200 ${
              isUserAttending
                ? 'bg-white hover:bg-red-200 text-red-600'
                : spotsLeft === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {isUserAttending ? 'Leave Game' : spotsLeft === 0 ? 'Game Full' : 'Join Game'}
          </button>
        </div>

        {/* Formation View */}
        <FootballFormation
          attendees={game.attendees}
          userProfiles={userProfiles}
          currentUserId={user?.uid || ''}
          maxPlayers={game.maxPlayers}
        />
      </main>
    </div>
  );
}
