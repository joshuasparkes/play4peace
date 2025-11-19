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
  name: string;
  isAdmin: boolean;
  lastActive: string;
}
