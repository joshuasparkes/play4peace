import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Game, Announcement, Photo, User } from '@/types';

// ========================================
// USERS COLLECTION
// ========================================

export const getUserDisplayName = async (uid: string): Promise<string> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    const userData = userDoc.data() as User;
    return userData.displayName;
  }
  return 'Unknown User';
};

export const getUsersDisplayNames = async (uids: string[]): Promise<{ [uid: string]: string }> => {
  const displayNames: { [uid: string]: string } = {};

  await Promise.all(
    uids.map(async (uid) => {
      displayNames[uid] = await getUserDisplayName(uid);
    })
  );

  return displayNames;
};

export const updateUser = async (uid: string, updates: Partial<User>): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, updates as any);
};

export const getUsersProfiles = async (uids: string[]): Promise<{ [uid: string]: { displayName: string; photoURL?: string } }> => {
  const profiles: { [uid: string]: { displayName: string; photoURL?: string } } = {};

  await Promise.all(
    uids.map(async (uid) => {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        profiles[uid] = {
          displayName: userData.displayName,
          photoURL: userData.photoURL,
        };
      }
    })
  );

  return profiles;
};

export const getAllUsers = async (): Promise<User[]> => {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data() } as User));
};

// ========================================
// GAMES COLLECTION
// ========================================

export const getGames = async (): Promise<Game[]> => {
  const gamesCol = collection(db, 'games');
  const q = query(gamesCol, orderBy('date', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
};

export const getGame = async (id: string): Promise<Game | null> => {
  const gameDoc = await getDoc(doc(db, 'games', id));
  if (gameDoc.exists()) {
    return { id: gameDoc.id, ...gameDoc.data() } as Game;
  }
  return null;
};

export const addGame = async (game: Omit<Game, 'id' | 'createdAt'>): Promise<string> => {
  const newGameRef = doc(collection(db, 'games'));
  const newGame = {
    ...game,
    createdAt: new Date().toISOString(),
  };
  await setDoc(newGameRef, newGame);
  return newGameRef.id;
};

export const updateGame = async (id: string, updates: Partial<Game>): Promise<void> => {
  const gameRef = doc(db, 'games', id);
  await updateDoc(gameRef, updates as any);
};

export const deleteGame = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'games', id));
};

export const toggleAttendance = async (gameId: string, userId: string): Promise<void> => {
  const gameRef = doc(db, 'games', gameId);
  const gameDoc = await getDoc(gameRef);

  if (gameDoc.exists()) {
    const game = gameDoc.data() as Game;
    const isAttending = game.attendees.includes(userId);

    await updateDoc(gameRef, {
      attendees: isAttending ? arrayRemove(userId) : arrayUnion(userId),
    });
  }
};

// ========================================
// ANNOUNCEMENTS COLLECTION
// ========================================

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const announcementsCol = collection(db, 'announcements');
  const q = query(announcementsCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
};

export const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<string> => {
  const newAnnouncementRef = doc(collection(db, 'announcements'));
  const newAnnouncement = {
    ...announcement,
    createdAt: new Date().toISOString(),
  };
  await setDoc(newAnnouncementRef, newAnnouncement);
  return newAnnouncementRef.id;
};

export const updateAnnouncement = async (id: string, updates: Partial<Announcement>): Promise<void> => {
  const announcementRef = doc(db, 'announcements', id);
  await updateDoc(announcementRef, updates as any);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'announcements', id));
};

// ========================================
// PHOTOS COLLECTION & STORAGE
// ========================================

export const getPhotos = async (): Promise<Photo[]> => {
  const photosCol = collection(db, 'photos');
  const q = query(photosCol, orderBy('uploadedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
};

export const getVisiblePhotos = async (): Promise<Photo[]> => {
  const photosCol = collection(db, 'photos');
  const q = query(photosCol, where('visible', '==', true), orderBy('uploadedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo));
};

export const uploadPhoto = async (
  file: File,
  weekDate: string,
  uploadedBy: string
): Promise<string> => {
  // Upload file to Firebase Storage
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const storageRef = ref(storage, `photos/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  // Create Firestore document
  const newPhotoRef = doc(collection(db, 'photos'));
  const newPhoto: Omit<Photo, 'id'> = {
    url: downloadURL,
    weekDate,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
    visible: false,
  };

  await setDoc(newPhotoRef, newPhoto);
  return newPhotoRef.id;
};

export const makePhotosVisible = async (weekDate: string): Promise<void> => {
  const photosCol = collection(db, 'photos');
  const q = query(photosCol, where('weekDate', '==', weekDate));
  const snapshot = await getDocs(q);

  const updatePromises = snapshot.docs.map(doc =>
    updateDoc(doc.ref, { visible: true })
  );

  await Promise.all(updatePromises);
};

export const deletePhoto = async (id: string): Promise<void> => {
  // Get photo document to get storage URL
  const photoDoc = await getDoc(doc(db, 'photos', id));

  if (photoDoc.exists()) {
    const photo = photoDoc.data() as Photo;

    // Delete from Storage
    try {
      const storageRef = ref(storage, photo.url);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting photo from storage:', error);
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'photos', id));
  }
};

// ========================================
// SEED DATA
// ========================================

export const seedInitialData = async (): Promise<void> => {
  // Check if games exist
  const gamesSnapshot = await getDocs(collection(db, 'games'));

  if (gamesSnapshot.empty) {
    // Add sample games
    const nextSaturday = new Date();
    nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7));

    await addGame({
      date: nextSaturday.toISOString().split('T')[0],
      time: '10:00',
      location: 'Community Football Pitch',
      maxPlayers: 22,
      attendees: [],
    });

    const followingSaturday = new Date(nextSaturday);
    followingSaturday.setDate(followingSaturday.getDate() + 7);

    await addGame({
      date: followingSaturday.toISOString().split('T')[0],
      time: '10:00',
      location: 'Community Football Pitch',
      maxPlayers: 22,
      attendees: [],
    });
  }

  // Check if announcements exist
  const announcementsSnapshot = await getDocs(collection(db, 'announcements'));

  if (announcementsSnapshot.empty) {
    await addAnnouncement({
      title: 'Welcome to Play4Peace!',
      content: 'Thanks for joining our football community. Book your spot for upcoming games and stay tuned for announcements!',
      author: 'Admin',
    });
  }
};
