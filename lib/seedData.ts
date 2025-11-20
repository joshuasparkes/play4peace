import { addGame, addAnnouncement, getGames, getAnnouncements } from './storage';

export const seedInitialData = () => {
  // Only seed if no data exists
  if (getGames().length === 0) {
    // Add some sample games
    const nextSaturday = new Date();
    nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7));

    addGame({
      date: nextSaturday.toISOString().split('T')[0],
      time: '10:00',
      location: 'Community Football Pitch',
      maxPlayers: 22,
      attendees: [],
    });

    const followingSaturday = new Date(nextSaturday);
    followingSaturday.setDate(followingSaturday.getDate() + 7);

    addGame({
      date: followingSaturday.toISOString().split('T')[0],
      time: '10:00',
      location: 'Community Football Pitch',
      maxPlayers: 22,
      attendees: [],
    });
  }

  if (getAnnouncements().length === 0) {
    // Add a welcome announcement
    addAnnouncement({
      title: 'Welcome to Play4Peace!',
      content: 'Thanks for joining our football community. Book your spot for upcoming games and stay tuned for announcements!',
      author: 'Admin',
    });
  }
};
