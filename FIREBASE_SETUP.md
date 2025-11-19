# Firebase Setup Guide for Play for Peace

This guide will help you set up Firebase for the Play for Peace application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter "play4peace" as the project name
4. Click "Continue" and follow the setup wizard
5. Disable Google Analytics (optional, you can enable it later if needed)
6. Click "Create project"

## Step 2: Register Your Web App

1. In the Firebase Console, click the web icon (`</>`) to add a web app
2. Enter "Play for Peace Web" as the app nickname
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. You'll see your Firebase configuration - **save this for later**

## Step 3: Enable Authentication

1. In the Firebase Console, go to "Build" > "Authentication"
2. Click "Get started"
3. Click on "Email/Password" under "Sign-in method"
4. Enable "Email/Password" (keep "Email link" disabled)
5. Click "Save"

## Step 4: Set Up Firestore Database

1. In the Firebase Console, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (we'll add security rules later)
4. Choose your Cloud Firestore location (pick one close to your users)
5. Click "Enable"

### Add Security Rules

After creating the database, click on "Rules" and replace with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Games collection
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow create: if request.auth.token.isAdmin == true;
      allow update: if request.auth != null;
      allow delete: if request.auth.token.isAdmin == true;
    }

    // Announcements collection
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth.token.isAdmin == true;
    }

    // Photos collection
    match /photos/{photoId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth.token.isAdmin == true;
    }
  }
}
```

Click "Publish" to save the rules.

## Step 5: Set Up Firebase Storage

1. In the Firebase Console, go to "Build" > "Storage"
2. Click "Get started"
3. Start in test mode (we'll secure it later)
4. Choose the same location as your Firestore database
5. Click "Done"

### Add Storage Rules

Click on "Rules" and replace with:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.isAdmin == true;
    }
  }
}
```

## Step 6: Configure Your App

1. Copy your Firebase configuration from Step 2
2. Open the `.env.local` file in your project root
3. Replace the placeholder values with your actual Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

## Step 7: Create Your First Admin User

1. Run the app: `npm run dev`
2. Go to `http://localhost:3000/signup`
3. Create an account with your email
4. Go to Firebase Console > Authentication > Users
5. Click on your user
6. Click "Custom claims" and add:
   ```json
   {"isAdmin": true}
   ```
7. Logout and login again to get admin access

## Step 8: Update Firestore Rules for Admin

To make the admin claims work, update your Firestore security rules to use custom claims:

The rules in Step 4 already reference `request.auth.token.isAdmin`. This will work once you set the custom claim.

## Firestore Collections Structure

The app will automatically create these collections:

### `users` Collection
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  isAdmin: boolean,
  photoURL?: string,
  createdAt: string,
  lastActive: string
}
```

### `games` Collection
```typescript
{
  id: string,
  date: string,
  time: string,
  location: string,
  maxPlayers: number,
  attendees: string[], // array of user UIDs
  createdAt: string
}
```

### `announcements` Collection
```typescript
{
  id: string,
  title: string,
  content: string,
  author: string,
  createdAt: string
}
```

### `photos` Collection
```typescript
{
  id: string,
  url: string, // Firebase Storage URL
  weekDate: string,
  uploadedBy: string,
  uploadedAt: string,
  visible: boolean
}
```

## Troubleshooting

### "Permission denied" errors
- Make sure you're logged in
- Check that your Firestore rules are published
- For admin operations, make sure the `isAdmin` custom claim is set

### Firebase not initialized
- Check that all environment variables in `.env.local` are set correctly
- Restart your development server after changing `.env.local`

### Authentication not working
- Make sure Email/Password is enabled in Firebase Console
- Check browser console for error messages

## Next Steps

1. Create test data in Firestore manually or through the admin panel
2. Test the booking system
3. Upload photos through the admin panel
4. Deploy to production (Vercel recommended)

For production deployment, make sure to:
- Set up environment variables in your hosting platform
- Update security rules to be more restrictive
- Set up proper error handling and monitoring
