// src/utlis/firebaseConfig.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Determine Firebase configuration based on environment
// Firebase App Hosting injects FIREBASE_WEBAPP_CONFIG for client-side use
// We also keep NEXT_PUBLIC_... for local development setup if not using emulators
const firebaseClientConfig = process.env.FIREBASE_WEBAPP_CONFIG
  ? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG) // Parse the JSON string
  : {
      // Fallback for local development if not using 'firebase emulators' or 'firebase serve'
      // These should be defined in your .env.local file
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

let app;
let auth;
let db;
let functionsInstance;

// Only initialize Firebase client-side SDK if it's not already initialized
// This prevents "duplicate-app" errors and handles SSR/build environments gracefully.
if (!getApps().length) {
  try {
    // Attempt to initialize the app
    app = initializeApp(firebaseClientConfig);

    // Get service instances ONLY if app initialization was successful
    auth = getAuth(app);
    db = getFirestore(app);
    functionsInstance = getFunctions(app);

    // Connect to emulators ONLY in a browser-like development environment
    // where window is defined (i.e., not during server-side build or SSR)
    // and if NODE_ENV is development.
    if (typeof window !== 'undefined' && process.env.NODE_ENV === "development") {
        console.log("Connecting to Firebase Emulators (Client-side)");
        try {
            connectAuthEmulator(auth, "http://127.0.0.1:9099");
            connectFirestoreEmulator(db, "127.0.0.1", 8080);
            connectFunctionsEmulator(functionsInstance, '127.0.0.1', 5001);
        } catch (e) {
            console.warn("Failed to connect to Firebase Emulators. Make sure they are running locally.", e);
        }
    }
  } catch (error) {
    // THIS IS THE ERROR YOU ARE SEEING IN THE BROWSER CONSOLE
    console.error("Firebase client app initialization failed:", error);
    // Important: Do NOT re-throw the error here. Allow the app to proceed,
    // but the Firebase services (auth, db, etc.) will be undefined.
  }
} else {
  // If app is already initialized, get the existing instances
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  functionsInstance = getFunctions(app);
}

// Export initialized services and the app instance itself for other modules to use
export { app, auth, db, functionsInstance };