// src/utlis/firebaseConfig.js (or wherever you keep your client-side config)

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Determine Firebase configuration based on environment
// Firebase App Hosting injects FIREBASE_WEBAPP_CONFIG for client-side use
// We also keep NEXT_PUBLIC_... for local development setup if not using emulators
const firebaseClientConfig = process.env.FIREBASE_WEBAPP_CONFIG
  ? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG)
  : {
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
    app = initializeApp(firebaseClientConfig);
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
    console.error("Firebase client app initialization failed:", error);
    // You might want to log this but not necessarily throw,
    // as it might be an expected "soft" failure during server-side imports
    // if a component accidentally imports this for non-client-side use.
  }
} else {
  // If app is already initialized, get the existing instances
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  functionsInstance = getFunctions(app); // Ensure functions instance is also retrieved
}

// Export initialized services and the app instance itself for other modules to use
export { app, auth, db, functionsInstance };