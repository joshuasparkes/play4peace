'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPhotos, uploadPhoto, deletePhoto, makePhotosVisible } from '@/lib/firestore';
import { Photo } from '@/types';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import Image from 'next/image';

export default function PhotoManager() {
  const { user } = useFirebaseAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [weekDate, setWeekDate] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadPhotos();
    const today = new Date().toISOString().split('T')[0];
    setWeekDate(today);
  }, []);

  const loadPhotos = async () => {
    try {
      const loadedPhotos = await getPhotos();
      setPhotos(loadedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file =>
        file.type.startsWith('image/')
      );
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !weekDate) {
      alert('Please select files and a week date');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = selectedFiles.map(file =>
        uploadPhoto(file, weekDate, user?.displayName || 'Admin')
      );

      await Promise.all(uploadPromises);

      setSelectedFiles([]);
      await loadPhotos();
      alert(`${selectedFiles.length} photo(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      try {
        await deletePhoto(id);
        await loadPhotos();
      } catch (error) {
        console.error('Error deleting photo:', error);
        alert('Failed to delete photo. Please try again.');
      }
    }
  };

  const handleMakeVisible = async (weekDate: string) => {
    if (confirm(`Make all photos from ${new Date(weekDate).toLocaleDateString('en-GB')} visible to users?`)) {
      try {
        await makePhotosVisible(weekDate);
        await loadPhotos();
      } catch (error) {
        console.error('Error making photos visible:', error);
        alert('Failed to make photos visible. Please try again.');
      }
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const groupedPhotos = groupPhotosByWeek();
  const weeks = Object.keys(groupedPhotos).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Manage Photos</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Photos</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Week Date
          </label>
          <input
            type="date"
            value={weekDate}
            onChange={(e) => setWeekDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Photos will be grouped by this week
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4">
            <label className="cursor-pointer">
              <span className="text-primary-600 hover:text-primary-700 font-medium">
                Click to upload
              </span>
              <span className="text-gray-600"> or drag and drop</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, GIF up to 10MB each
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Selected files ({selectedFiles.length}):
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeSelectedFile(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 w-full bg-primary-600 text-white py-2 px-4 rounded-pill hover:bg-primary-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo${selectedFiles.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {weeks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No photos uploaded yet.</p>
          </div>
        ) : (
          weeks.map(week => {
            const weekPhotos = groupedPhotos[week];
            const allVisible = weekPhotos.every(p => p.visible);

            return (
              <div key={week} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Week of {formatDate(week)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {weekPhotos.length} photo{weekPhotos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {!allVisible && (
                    <button
                      onClick={() => handleMakeVisible(week)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-pill hover:bg-primary-700 transition text-sm font-medium"
                    >
                      Make Visible to Users
                    </button>
                  )}
                  {allVisible && (
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                      Visible
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {weekPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={photo.url}
                          alt={`Photo from ${week}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {!photo.visible && (
                        <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Hidden
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
