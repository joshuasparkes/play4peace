# Fix Firebase Storage Upload Error

You're seeing a CORS error when uploading photos, but this is actually a **Firebase Storage Security Rules** issue.

## The Problem

The error message says "CORS policy" but it's actually because Firebase Storage is blocking your upload due to security rules. By default, Firebase Storage may have restrictive rules.

## The Solution

You need to update your Firebase Storage security rules to allow authenticated users (especially admins) to upload photos.

### Step 1: Go to Firebase Console

1. Open https://console.firebase.google.com/
2. Select your `play4peace` project
3. Go to **Build** → **Storage**
4. Click on the **Rules** tab

### Step 2: Update Storage Rules

Replace the existing rules with these:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read photos (for public gallery)
    match /photos/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

### Step 3: Publish the Rules

Click **Publish** to save the changes.

## More Secure Version (Recommended for Production)

For production, you should restrict uploads to admin users only:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{fileName} {
      // Anyone can read photos
      allow read: if true;

      // Only authenticated admins can upload or delete
      allow write, delete: if request.auth != null &&
                             request.auth.token.isAdmin == true;
    }
  }
}
```

**Note:** For the admin-only version to work, you need to:
1. Set custom claims on your admin users (see FIREBASE_SETUP.md Step 7)
2. Make sure you're logged in as an admin user when uploading photos

## Testing

After updating the rules:
1. Refresh your browser (clear cache if needed)
2. Try uploading a photo again
3. The upload should work now!

## Still Getting Errors?

If you're still seeing issues:
1. Check the browser console for detailed error messages
2. Verify you're logged in to the app
3. Check that Firebase Authentication is working
4. Try logging out and logging back in
5. Make sure the rules are published (not just saved as draft)
