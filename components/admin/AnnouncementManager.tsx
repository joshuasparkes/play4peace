'use client';

import { useState, useEffect } from 'react';
import { getAnnouncements, addAnnouncement, deleteAnnouncement } from '@/lib/firestore';
import { Announcement } from '@/types';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

export default function AnnouncementManager() {
  const { user } = useFirebaseAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const loadedAnnouncements = await getAnnouncements();
      setAnnouncements(loadedAnnouncements);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAnnouncement({
        ...formData,
        author: user?.displayName || 'Admin',
      });
      setFormData({
        title: '',
        content: '',
      });
      setShowForm(false);
      await loadAnnouncements();
    } catch (error) {
      console.error('Error adding announcement:', error);
      alert('Failed to add announcement. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(id);
        await loadAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Failed to delete announcement. Please try again.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Announcements</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-pill hover:bg-primary-700 transition font-medium"
        >
          {showForm ? 'Cancel' : 'Post New Announcement'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Announcement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Important Update"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Share important information with all players..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-pill hover:bg-primary-700 transition font-semibold"
            >
              Post Announcement
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No announcements yet.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  <div className="mt-3 text-sm text-gray-500">
                    By {announcement.author} • {formatDate(announcement.createdAt)}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(announcement.id)}
                  className="ml-4 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
