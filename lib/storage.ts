import { Game, Announcement, Photo, User } from '@/types';

const STORAGE_KEYS = {
  GAMES: 'play4peace_games',
  ANNOUNCEMENTS: 'play4peace_announcements',
  PHOTOS: 'play4peace_photos',
  CURRENT_USER: 'play4peace_current_user',
} as const;

// Game storage functions
export const getGames = (): Game[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.GAMES);
  return data ? JSON.parse(data) : [];
};

export const saveGames = (games: Game[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
};

export const addGame = (game: Omit<Game, 'id' | 'createdAt'>) => {
  const games = getGames();
  const newGame: Game = {
    ...game,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  saveGames([...games, newGame]);
  return newGame;
};

export const updateGame = (id: string, updates: Partial<Game>) => {
  const games = getGames();
  const updatedGames = games.map(game =>
    game.id === id ? { ...game, ...updates } : game
  );
  saveGames(updatedGames);
};

export const deleteGame = (id: string) => {
  const games = getGames();
  saveGames(games.filter(game => game.id !== id));
};

export const toggleAttendance = (gameId: string, userName: string) => {
  const games = getGames();
  const updatedGames = games.map(game => {
    if (game.id === gameId) {
      const attendees = game.attendees.includes(userName)
        ? game.attendees.filter(name => name !== userName)
        : [...game.attendees, userName];
      return { ...game, attendees };
    }
    return game;
  });
  saveGames(updatedGames);
};

// Announcement storage functions
export const getAnnouncements = (): Announcement[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
  return data ? JSON.parse(data) : [];
};

export const saveAnnouncements = (announcements: Announcement[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
};

export const addAnnouncement = (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
  const announcements = getAnnouncements();
  const newAnnouncement: Announcement = {
    ...announcement,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  saveAnnouncements([newAnnouncement, ...announcements]);
  return newAnnouncement;
};

export const deleteAnnouncement = (id: string) => {
  const announcements = getAnnouncements();
  saveAnnouncements(announcements.filter(ann => ann.id !== id));
};

// Photo storage functions
export const getPhotos = (): Photo[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PHOTOS);
  return data ? JSON.parse(data) : [];
};

export const savePhotos = (photos: Photo[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
};

export const addPhoto = (photo: Omit<Photo, 'id' | 'uploadedAt' | 'visible'>) => {
  const photos = getPhotos();
  const newPhoto: Photo = {
    ...photo,
    id: crypto.randomUUID(),
    uploadedAt: new Date().toISOString(),
    visible: false,
  };
  savePhotos([...photos, newPhoto]);
  return newPhoto;
};

export const makePhotosVisible = (weekDate: string) => {
  const photos = getPhotos();
  const updatedPhotos = photos.map(photo =>
    photo.weekDate === weekDate ? { ...photo, visible: true } : photo
  );
  savePhotos(updatedPhotos);
};

export const deletePhoto = (id: string) => {
  const photos = getPhotos();
  savePhotos(photos.filter(photo => photo.id !== id));
};

// User storage functions
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const saveCurrentUser = (user: User) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const clearCurrentUser = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};
