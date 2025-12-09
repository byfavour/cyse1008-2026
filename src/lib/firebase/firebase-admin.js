// src/lib/firebase/firebase-admin.js
import admin from 'firebase-admin';

let initialized = false;

function tryInitializeFirebaseAdmin() {
  if (initialized || admin.apps.length) {
    initialized = true;
    return admin;
  }

  // Prefer explicit env, then framework-provided FIREBASE_CONFIG, then GCP defaults.
  const firebaseConfig = (() => {
    try {
      return process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG) : null;
    } catch (e) {
      return null;
    }
  })();

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    firebaseConfig?.projectId;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  const errors = [];

  // (1) Explicit service account
  try {
    if (clientEmail && privateKey && projectId) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        storageBucket,
      });
      initialized = true;
      return admin;
    }
  } catch (error) {
    errors.push(error);
  }

  // (2) Application default credentials (Cloud env / gcloud auth)
  try {
    admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId, storageBucket });
    initialized = true;
    return admin;
  } catch (error) {
    errors.push(error);
  }

  // (2b) Default credentials fallback (GAE/Cloud Functions)
  try {
    admin.initializeApp({ projectId, storageBucket });
    initialized = true;
    return admin;
  } catch (error) {
    errors.push(error);
  }

  // (2c) Framework-provided FIREBASE_CONFIG / automatic detection
  try {
    admin.initializeApp(firebaseConfig || undefined);
    initialized = true;
    return admin;
  } catch (error) {
    errors.push(error);
  }

  // If all attempts failed, surface the errors to aid debugging.
  if (errors.length) {
    throw errors[errors.length - 1];
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
