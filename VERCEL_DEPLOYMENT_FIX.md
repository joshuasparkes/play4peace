# Fix Vercel Deployment - Firebase Environment Variables

Your deployment is failing because Firebase environment variables are not configured in Vercel.

## Error:
```
Error [FirebaseError]: Firebase: Error (auth/invalid-api-key).
```

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your `play4peace` project
3. Click **Settings** (in the top navigation)
4. Click **Environment Variables** (in the left sidebar)

### Step 2: Add Firebase Variables

Add the following environment variables one by one:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDoMPwLG1gK78b1sUo_ZRrticBozKDwn08` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `play4peace-d244e.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `play4peace-d244e` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `play4peace-d244e.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `104957252306` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:104957252306:web:f77ddda10e6b3f51c1d30b` |

### Step 3: Select Environments

For each variable, make sure to check all three environments:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

### Step 4: Redeploy

After adding all variables:
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click **Redeploy**

OR

Just push a new commit to trigger a fresh deployment:
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

## Alternative: Use Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# Paste: AIzaSyDoMPwLG1gK78b1sUo_ZRrticBozKDwn08

vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# Paste: play4peace-d244e.firebaseapp.com

vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
# Paste: play4peace-d244e

vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
# Paste: play4peace-d244e.firebasestorage.app

vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
# Paste: 104957252306

vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
# Paste: 1:104957252306:web:f77ddda10e6b3f51c1d30b

# Redeploy
vercel --prod
```

## Verification

After redeployment:
1. Check the build logs - should complete successfully
2. Visit your deployed site
3. Try logging in - Firebase auth should work

## Security Note

These environment variables are safe to expose publicly because they have the `NEXT_PUBLIC_` prefix. They're meant to be used in the browser. Your Firebase security is protected by:
- Firestore Security Rules
- Firebase Authentication
- Storage Security Rules

Your deployment should succeed after adding these variables! 🚀
