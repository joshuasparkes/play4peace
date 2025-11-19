# Play for Peace Football App

A modern web application for managing football club activities, built with Next.js 16, TypeScript, and Tailwind CSS.

## Features

### User Features
- **Simple Authentication**: No account required - just enter your name to join
- **Game Booking**: View upcoming games and confirm attendance (170-200 player capacity)
- **Announcements Feed**: Stay updated with club news and updates
- **Photo Gallery**: Browse weekly football photos organized by game date
- **Mobile Optimized**: Fully responsive design with fixed bottom navigation on mobile

### Admin Features
- **Game Management**: Create and schedule upcoming games with location and player limits
- **Announcement Posting**: Share important updates with all players
- **Photo Upload**:
  - Drag-and-drop photo upload
  - Organize photos by week
  - Control visibility (photos can be uploaded and made visible the next day)
  - Support for photographer access

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: FontAwesome
- **Storage**: LocalStorage (client-side, for demo purposes)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Building for Production

```bash
npm run build
npm start
```

## Usage

### User Access
1. Visit the homepage
2. Enter your name
3. Start booking games, viewing announcements, and browsing photos

### Admin Access
1. Navigate to `/admin` or click the Admin button (if logged in as admin)
2. Enter your name and the admin passcode: `4peace`
3. Access three admin panels:
   - **Games**: Schedule new games, view attendees
   - **Announcements**: Post updates
   - **Photos**: Upload and manage photo gallery

## Project Structure

```
play4peace/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel
│   ├── announcements/     # Announcements page
│   ├── gallery/           # Photo gallery
│   └── page.tsx           # Games/booking page
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── LoginForm.tsx     # Name entry form
│   └── Navigation.tsx    # App navigation
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state
├── lib/                  # Utilities
│   ├── storage.ts        # LocalStorage helpers
│   └── seedData.ts       # Sample data seeding
└── types/                # TypeScript types
    └── index.ts          # Shared type definitions
```

## Mobile Optimization

- Sticky header navigation on desktop
- Fixed bottom navigation on mobile devices
- Responsive layouts for all screen sizes
- Touch-optimized interactions
- Truncated text for small screens

## Future Enhancements

- Backend database integration (replace LocalStorage)
- Real user authentication with secure login
- Push notifications for new announcements
- Image optimization and CDN storage
- Player statistics and attendance tracking
- Payment integration for game fees

## License

This project is built for Play for Peace Football Club.
