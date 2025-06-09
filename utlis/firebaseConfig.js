// src/utlis/firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

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

if (!getApps().length) {
    try {
        app = initializeApp(firebaseClientConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        functionsInstance = getFunctions(app);

        // Integrate NEXT_PUBLIC_USE_FIREBASE_EMULATOR here
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
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
    }
} else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    functionsInstance = getFunctions(app);
}

export { app, auth, db, functionsInstance };