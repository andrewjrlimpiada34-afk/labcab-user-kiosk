# LabCab | Smart Laboratory Cabinet

A modern kiosk-style application for managing laboratory equipment borrowing and returning.

## Deployment Instructions

### 1. Firebase (Backend)
This application uses **Firebase Firestore** and **Authentication** for real-time data and user management.
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. **Firestore**: Enable Firestore in Production mode.
4. **Authentication**: Enable the "Email/Password" provider.
5. **Credentials**: Go to Project Settings, add a Web App, and copy the `firebaseConfig` object.

### 2. Vercel (Frontend & Server Functions)
The application is optimized for Vercel, which handles both the Next.js UI and Server Actions.
1. Push your code to GitHub.
2. Connect your repository to [Vercel](https://vercel.com).
3. Add the following **Environment Variables**:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GOOGLE_GENAI_API_KEY` (Your Gemini API key)

### 3. Kiosk Setup
For deployment on a physical kiosk (e.g., Raspberry Pi):
- Ensure the device is connected to the internet.
- Run the browser in "Kiosk Mode" targeting your Vercel URL.
- Recommended browser: Chromium with the `--kiosk` flag.

## Local Development
1. Clone the repository.
2. Add your Firebase credentials to a `.env.local` file.
3. Run `npm install`.
4. Run `npm run dev`.
