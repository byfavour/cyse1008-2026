import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let appInstance = null;

function initAdminApp() {
  if (appInstance) return appInstance;
  if (getApps().length) {
    appInstance = getApps()[0];
    return appInstance;
  }

  // Prefer explicit env, then FIREBASE_CONFIG, then ADC.
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
  if (clientEmail && privateKey && projectId) {
    try {
      appInstance = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
        storageBucket,
      });
      return appInstance;
    } catch (error) {
      errors.push(error);
    }
  }

  // (2) Application default credentials (ADC)
  try {
    appInstance = initializeApp({
      credential: applicationDefault(),
      projectId,
      storageBucket,
    });
    return appInstance;
  } catch (error) {
    errors.push(error);
  }

  // (3) FIREBASE_CONFIG / auto detection
  try {
    appInstance = initializeApp(firebaseConfig || undefined);
    return appInstance;
  } catch (error) {
    errors.push(error);
  }

  // (4) Last-resort default init
  try {
    appInstance = initializeApp();
    return appInstance;
  } catch (error) {
    errors.push(error);
  }

  if (errors.length) {
    throw errors[errors.length - 1];
  }

  throw new Error(
    'Firebase Admin not initialized. Set FIREBASE_PRIVATE_KEY/FIREBASE_CLIENT_EMAIL or GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

export function getAdmin() {
  return initAdminApp();
}

export function getDb() {
  return getFirestore(initAdminApp());
}

export function getBucket() {
  return getStorage(initAdminApp()).bucket();
}
