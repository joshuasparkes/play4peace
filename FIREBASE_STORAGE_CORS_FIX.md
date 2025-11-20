# Firebase Storage CORS Configuration

If images appear as black boxes but load correctly on the admin page, this might be a CORS (Cross-Origin Resource Sharing) issue.

## Quick Test

1. Open this URL directly in your browser:
   ```
   https://firebasestorage.googleapis.com/v0/b/play4peace-d244e.firebasestorage.app/o/photos%2F1763587337331_Agents%20List.png?alt=media&token=e08cdc8f-d4ee-422c-bc77-3fe581ed0c49
   ```

2. If the image loads in the browser tab, it's a CORS issue
3. If the image doesn't load at all, it's a permission/access issue

## Fix CORS Issue

### Option 1: Configure CORS via Google Cloud Console

1. Install Google Cloud SDK (if not already installed):
   ```bash
   curl https://sdk.cloud.google.com | bash
   ```

2. Create a `cors.json` file in your project root:
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

3. Apply CORS configuration:
   ```bash
   gcloud storage buckets update gs://play4peace-d244e.firebasestorage.app --cors-file=cors.json
   ```

### Option 2: Configure via Firebase Console

Unfortunately, Firebase Console doesn't have a direct UI for CORS settings. You need to use the Cloud Console method above.

### Option 3: Use Cloud Shell (Easiest)

1. Go to https://console.cloud.google.com/
2. Select your `play4peace-d244e` project
3. Click the Cloud Shell icon (terminal icon in top right)
4. Run these commands:

```bash
# Create cors.json
cat > cors.json << 'EOF'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply CORS configuration
gcloud storage buckets update gs://play4peace-d244e.firebasestorage.app --cors-file=cors.json
```

## Alternative: Check Storage Rules

Your Storage rules might be blocking reads. Update in Firebase Console:

1. Go to Firebase Console → Storage → Rules
2. Make sure you have:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{fileName} {
      allow read: if true;  // ← Make sure this is 'true', not restricted
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

## Verify the Fix

After applying CORS or updating rules:
1. Clear browser cache (Cmd+Shift+Delete on Mac)
2. Reload the gallery page
3. Images should now display correctly

## If Still Not Working

Check the browser console Network tab:
1. Open Dev Tools (F12 or Cmd+Option+I)
2. Go to Network tab
3. Reload the page
4. Look for the image requests - are they returning 200 OK or an error code?
5. Share the status code and error message
