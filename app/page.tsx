'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import LoginForm from '@/components/LoginForm';
import Navigation from '@/components/Navigation';
import { getGames, toggleAttendance } from '@/lib/storage';
import { seedInitialData } from '@/lib/seedData';
import { Game } from '@/types';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      seedInitialData();
      loadGames();
    }
  }, [isAuthenticated]);

  const loadGames = () => {
    const loadedGames = getGames();
    const sortedGames = loadedGames.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setGames(sortedGames);
    setLoading(false);
  };

  const handleToggleAttendance = (gameId: string) => {
    if (user?.name) {
      toggleAttendance(gameId, user.name);
      loadGames();
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

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              const isUserAttending = game.attendees.includes(user?.name || '');
              const spotsLeft = game.maxPlayers - game.attendees.length;

              return (
                <div key={game.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2"></div>

                  <div className="p-6">
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
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${(game.attendees.length / game.maxPlayers) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Game is full'}
                      </p>
                    </div>

                    {game.attendees.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 mb-2">Confirmed players:</p>
                        <div className="flex flex-wrap gap-2">
                          {game.attendees.slice(0, 5).map((attendee, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {attendee}
                            </span>
                          ))}
                          {game.attendees.length > 5 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{game.attendees.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleToggleAttendance(game.id)}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                        isUserAttending
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : spotsLeft > 0
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!isUserAttending && spotsLeft === 0}
                    >
                      {isUserAttending ? "I can't make it" : spotsLeft > 0 ? "I'm playing!" : 'Game is full'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
