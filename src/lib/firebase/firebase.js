import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------
// Check if running on localhost
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const isFirebase = CONFIG.auth.method === 'firebase';
// Merge emulator config dynamically if on localhost
const firebaseConfig = isLocalhost
  ? { ...CONFIG.firebase, ...CONFIG.firebaselocal }
  : CONFIG.firebase;

export const firebaseApp = isFirebase ? initializeApp(firebaseConfig) : {};

export const AUTH = isFirebase ? getAuth(firebaseApp) : {};

export const FIRESTORE = isFirebase ? getFirestore(firebaseApp) : {};

export const storage = getStorage(firebaseApp);

export const db = getFirestore(firebaseApp);

// Point to the Storage emulator running on localhost.
console.log({ isLocalhost });
connectAuthEmulator(AUTH, 'http://127.0.0.1:9099');
connectStorageEmulator(storage, '127.0.0.1', 9199);
connectFirestoreEmulator(db, '127.0.0.1', 8080);
