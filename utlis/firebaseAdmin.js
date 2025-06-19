// src/utlis/firebaseAdmin.js
import * as admin from 'firebase-admin';

// Check if a Firebase app has already been initialized to prevent errors in development mode
if (!admin.apps.length) {
  try {
    // Initialize Firebase Admin SDK using application default credentials.
    // This is the recommended way for environments like Firebase App Hosting,
    // Cloud Functions, or Cloud Run, as it automatically picks up the service account
    // associated with the execution environment.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      // The projectId is often automatically inferred with applicationDefault(),
      // but explicitly providing it from a server-side environment variable
      // (without NEXT_PUBLIC_) can be a good fallback or for clarity.
      projectId: process.env.FIREBASE_PROJECT_ID // Use regular env variable for server-side
    });
    console.log("Firebase Admin SDK initialized successfully with applicationDefault.");
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error);
    // In a production environment, you might want to crash the app if the SDK fails to initialize
    // throw new Error("Failed to initialize Firebase Admin SDK.");
  }
}

// Export the Firestore instance from the initialized admin app
const adminDb = admin.firestore();

export { adminDb, admin };
