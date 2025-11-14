// src/lib/firebase/firebase-admin.js
import admin from 'firebase-admin';

function ensureFirebaseAdmin() {
  if (admin.apps.length) return;

  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (clientEmail && privateKey && projectId) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      storageBucket,
    });
    return;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin.initializeApp({ storageBucket });
    return;
  }

  if (process.env.FIRESTORE_EMULATOR_HOST && projectId) {
    // Emulator dev: credentials optional, projectId required
    admin.initializeApp({ projectId, storageBucket });
    return;
  }

  throw new Error(
    'Missing Firebase Admin credentials. Provide FIREBASE_PRIVATE_KEY/FIREBASE_CLIENT_EMAIL or GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

ensureFirebaseAdmin();

export const db = admin.firestore();
export const bucket = admin.storage().bucket();
export default admin;
