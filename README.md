# SeguidorsExpress Deployment Guide (Vercel)

This project is ready to be deployed to Vercel. Follow these steps to set up your production environment.

## 1. Prerequisites
- A [Vercel](https://vercel.com) account.
- Your Firebase project credentials.

## 2. Environment Variables
When importing the project to Vercel, you **MUST** add the following Environment Variables in the Vercel Dashboard (Settings > Environment Variables):

| Variable Name | Description |
|---------------|-------------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase App ID |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | (Optional) Your Firestore Database ID (defaults to `(default)`) |

## 3. Build Settings
Vercel should automatically detect the settings, but ensure they match:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 4. SPA Routing
The project includes a `vercel.json` file that handles Single Page Application (SPA) routing. This ensures that internal routes like `/wallet` or `/history` work correctly when the page is refreshed.

## 5. Firebase Authentication
Don't forget to add your Vercel deployment URL (e.g., `your-app.vercel.app`) to the **Authorized Domains** list in your Firebase Console (Authentication > Settings > Authorized Domains).
