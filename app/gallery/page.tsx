'use client';

import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { getVisiblePhotos } from '@/lib/firestore';
import { Photo } from '@/types';
import Image from 'next/image';

export default function GalleryPage() {
  const { isAuthenticated, loading: authLoading } = useFirebaseAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    } else if (isAuthenticated) {
      loadPhotos();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadPhotos = async () => {
    try {
      const loadedPhotos = await getVisiblePhotos();
      console.log('Loaded photos:', loadedPhotos);
      setPhotos(loadedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      alert('Error loading photos. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const groupPhotosByWeek = () => {
    const grouped: { [key: string]: Photo[] } = {};
    photos.forEach(photo => {
      if (!grouped[photo.weekDate]) {
        grouped[photo.weekDate] = [];
      }
      grouped[photo.weekDate].push(photo);
    });
    return grouped;
  };

  const formatWeekDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  const groupedPhotos = groupPhotosByWeek();
  const weeks = Object.keys(groupedPhotos).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  const filteredWeeks = selectedWeek ? [selectedWeek] : weeks;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Photo Gallery</h1>
          <p className="text-gray-600 mt-2">Relive the best moments from our games</p>
        </div>

        {weeks.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedWeek(null)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedWeek === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Weeks
            </button>
            {weeks.map(week => (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedWeek === week
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {formatWeekDate(week)}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading photos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 mt-4">No photos yet. Check back after the next game!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredWeeks.map(week => (
              <div key={week}>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Week of {formatWeekDate(week)}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupedPhotos[week].map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setFullscreenPhoto(photo)}
                      className="relative group cursor-pointer"
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                        <Image
                          src={photo.url}
                          alt={`Photo from ${week}`}
                          width={400}
                          height={400}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition flex items-end p-3 pointer-events-none rounded-lg">
                        <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition">
                          Uploaded by {photo.uploadedBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Fullscreen Modal */}
      {fullscreenPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4"
          onClick={() => setFullscreenPhoto(null)}
        >
          <button
            onClick={() => setFullscreenPhoto(null)}
            className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 transition z-10"
            aria-label="Close"
          >
            ×
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
            <Image
              src={fullscreenPhoto.url}
              alt="Fullscreen photo"
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="absolute bottom-4 left-0 right-0 text-center text-white">
            <p className="text-sm">Uploaded by {fullscreenPhoto.uploadedBy}</p>
            <p className="text-xs text-gray-300 mt-1">
              {formatWeekDate(fullscreenPhoto.weekDate)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
