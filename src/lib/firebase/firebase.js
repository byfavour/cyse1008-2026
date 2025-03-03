import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------
// Check if running on localhost
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

const isFirebase = CONFIG.auth.method === 'firebase';
// Merge emulator config dynamically if on localhost
const firebaseConfig = isLocalhost
  ? { ...CONFIG.firebase, ...CONFIG.firebaselocal }
  : CONFIG.firebase;

export const firebaseApp = isFirebase ? initializeApp(CONFIG.firebase) : {};

export const AUTH = isFirebase ? getAuth(firebaseApp) : {};

export const FIRESTORE = isFirebase ? getFirestore(firebaseApp) : {};

export const storage = getStorage(firebaseApp);

export const db = getFirestore(firebaseApp);
