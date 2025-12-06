import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------
// 1) Initialize the Firebase App
// ----------------------------------------------------------------------
const firebaseApp = initializeApp(CONFIG.firebase);

// ----------------------------------------------------------------------
// 2) Get the core services
// ----------------------------------------------------------------------
export const db = getFirestore(firebaseApp);
export const AUTH = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
const useEmulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === 'true';
const isBrowser = typeof window !== 'undefined';

if (useEmulators && isBrowser) {
  console.log('Connecting to Firebase emulators...');

  // Auth Emulator
  connectAuthEmulator(AUTH, 'http://127.0.0.1:9099', { disableWarnings: true });

  // Firestore Emulator
  connectFirestoreEmulator(db, '127.0.0.1', 8080);

  // Storage Emulator
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}
