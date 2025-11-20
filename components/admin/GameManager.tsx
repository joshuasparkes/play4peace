'use client';

import { useState, useEffect } from 'react';
import { getGames, addGame, updateGame, deleteGame, getUsersDisplayNames } from '@/lib/firestore';
import { Game } from '@/types';

export default function GameManager() {
  const [games, setGames] = useState<Game[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [userNames, setUserNames] = useState<{ [uid: string]: string }>({});
  const [formData, setFormData] = useState({
    date: '',
    time: '10:00',
    location: 'Community Football Pitch',
    maxPlayers: 22,
  });

  useEffect(() => {
    loadGames();
  }, []);

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGame) {
        // Update existing game
        await updateGame(editingGame.id, formData);
      } else {
        // Create new game
        await addGame({
          ...formData,
          attendees: [],
        });
      }
      setFormData({
        date: '',
        time: '10:00',
        location: 'Community Football Pitch',
        maxPlayers: 22,
      });
      setShowForm(false);
      setEditingGame(null);
      await loadGames();
    } catch (error) {
      console.error('Error saving game:', error);
      alert('Failed to save game. Please try again.');
    }
  };

  const handleEdit = (game: Game) => {
    setFormData({
      date: game.date,
      time: game.time,
      location: game.location,
      maxPlayers: game.maxPlayers,
    });
    setEditingGame(game);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      date: '',
      time: '10:00',
      location: 'Community Football Pitch',
      maxPlayers: 22,
    });
    setEditingGame(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteGame(id);
        await loadGames();
      } catch (error) {
        console.error('Error deleting game:', error);
        alert('Failed to delete game. Please try again.');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Games</h2>
        <button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition font-medium"
        >
          {showForm ? 'Cancel' : 'Add New Game'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingGame ? 'Edit Game' : 'Add New Game'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Players
              </label>
              <input
                type="number"
                min="2"
                max="100"
                value={formData.maxPlayers}
                onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-full hover:bg-purple-700 transition font-semibold"
            >
              {editingGame ? 'Update Game' : 'Create Game'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {games.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No games scheduled yet.</p>
          </div>
        ) : (
          games.map((game) => (
            <div key={game.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatDate(game.date)}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {game.time} • {game.location}
                  </p>
                  <div className="mt-3">
                    <span className="text-sm font-medium text-gray-700">
                      Players: {game.attendees.length} / {game.maxPlayers}
                    </span>
                    {game.attendees.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">Attendees:</p>
                        <div className="flex flex-wrap gap-1">
                          {game.attendees.map((attendeeUid, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-primary-800"
                            >
                              {userNames[attendeeUid] || 'Loading...'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(game)}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(game.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
