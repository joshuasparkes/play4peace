export interface Game {
  id: string;
  date: string;
  time: string;
  location: string;
  maxPlayers: number;
  attendees: string[];
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  weekDate: string;
  uploadedBy: string;
  uploadedAt: string;
  visible: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  photoURL?: string;
  createdAt: string;
  lastActive: string;
}

export interface UserProfile extends User {
  gamesAttended: number;
  totalGamesBooked: number;
}
