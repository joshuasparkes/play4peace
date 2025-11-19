# Firebase Blaze Plan - Final Setup Steps

You've upgraded to the Blaze plan! Now you need to configure Storage security rules to allow photo uploads.

## Step 1: Update Firebase Storage Rules

1. Go to https://console.firebase.google.com/
2. Select your `play4peace` project
3. Click on **Build** → **Storage**
4. Click on the **Rules** tab
5. Replace the existing rules with:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Photos folder - anyone can read, authenticated users can write
    match /photos/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

6. Click **Publish**

### Alternative (More Secure - Admin Only Uploads):

If you want only admins to upload photos:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{fileName} {
      // Anyone can read photos
      allow read: if true;

      // Only admins can upload/delete
      allow write, delete: if request.auth != null &&
                             request.auth.token.isAdmin == true;
    }
  }
}
```

## Step 2: Verify Storage is Enabled

1. In Firebase Console → Storage
2. Make sure you see "Get started" or a bucket URL like:
   `gs://play4peace-d244e.firebasestorage.app`
3. If you see "Get started", click it and follow the setup

## Step 3: Test Photo Upload

1. Go to your app's admin panel
2. Try uploading a photo
3. It should work now!

## Monitoring Costs

To keep track of your Firebase costs:

1. Go to Firebase Console
2. Click on **Usage and billing** in the left sidebar
3. You'll see:
   - Storage usage
   - Download bandwidth
   - Current month's costs

### Expected Costs for Your App:
- **Storage**: ~$0.50-1/month (assuming 20-50GB of photos)
- **Bandwidth**: ~$1-3/month (assuming 200 users viewing photos)
- **Total**: ~$2-5/month

### Free Tier (Even on Blaze):
- 5GB storage FREE
- 1GB/day download FREE
- You only pay for usage above these limits

## Troubleshooting

If uploads still fail:
1. Check that Storage rules are published
2. Make sure you're logged in to the app
3. Check browser console for detailed errors
4. Verify Storage is enabled in Firebase Console

## Next Steps

Once uploads work:
- Test the photo gallery
- Make photos visible from admin panel
- Share with your team!

Your app is now fully functional with Firebase Blaze! 🎉
