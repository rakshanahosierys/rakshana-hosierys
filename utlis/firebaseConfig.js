import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
// IMPORTANT: Initialize the functions service here
const functionsInstance = getFunctions(app); // Renamed to 'functionsInstance' to avoid naming conflict with imported 'functions' object

// Use emulators in development mode
if (process.env.NODE_ENV === "development") {
    console.log("Using Firebase Emulators");
    try {
        connectAuthEmulator(auth, "http://127.0.0.1:9099");
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
        // Now 'functionsInstance' is defined and can be used
        connectFunctionsEmulator(functionsInstance, '127.0.0.1', 5001);
    } catch (e) {
        console.error("Failed to connect to Firebase Emulators. Make sure they are running and accessible.", e);
        // You might want to remove this error for production builds or handle it gracefully
    }
}

// Export initialized services and the app instance itself for other modules to use
export { app, auth, db, functionsInstance };