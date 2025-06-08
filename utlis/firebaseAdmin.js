// src/utlis/firebaseAdmin.js
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  // Initialize Firebase Admin SDK
  // For Cloud Functions/Firebase App Hosting, this will automatically pick up
  // credentials from the environment.
  // You can also explicitly set projectId from env if needed.
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID // This will be injected by Firebase App Hosting
  });
}

const adminDb = admin.firestore();

export { adminDb };