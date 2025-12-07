// src/lib/firebase/firebase-admin.js
import admin from 'firebase-admin';

let initialized = false;

function tryInitializeFirebaseAdmin() {
  if (initialized || admin.apps.length) {
    initialized = true;
    return admin;
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  // (1) Explicit service account
  if (clientEmail && privateKey && projectId) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      storageBucket,
    });
    initialized = true;
    return admin;
  }

  // (2) Application default credentials (Cloud env / gcloud auth)
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
      storageBucket,
    });
    initialized = true;
    return admin;
  } catch (error) {
    // swallow and continue to other fallbacks
  }

  // (2b) Default credentials fallback (GAE/Cloud Functions)
  try {
    admin.initializeApp({
      projectId,
      storageBucket,
    });
    initialized = true;
    return admin;
  } catch (error) {
    // swallow and continue to emulator fallback
  }

  // (3) Emulator fallback (no creds)
  if (process.env.FIRESTORE_EMULATOR_HOST && projectId) {
    admin.initializeApp({ projectId, storageBucket });
    initialized = true;
    return admin;
  }

  // Not initialized; let caller decide how to handle
  return null;
}

function requireInitialized(message) {
  const app = tryInitializeFirebaseAdmin();
  if (!app) {
    throw new Error(
      message ||
        'Firebase Admin not initialized. Set FIREBASE_PRIVATE_KEY/FIREBASE_CLIENT_EMAIL or GOOGLE_APPLICATION_CREDENTIALS.'
    );
  }
  return app;
}

export function getAdmin() {
  return requireInitialized();
}

export function getDb() {
  return requireInitialized().firestore();
}

export function getBucket() {
  return requireInitialized().storage().bucket();
}

export default admin;
