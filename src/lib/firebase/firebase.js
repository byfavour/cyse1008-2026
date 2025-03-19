import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

import { CONFIG } from 'src/config-global';

const isFirebase = CONFIG.auth.method === 'firebase';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

console.log({ isLocalhost });

const firebaseConfig = isLocalhost
  ? { ...CONFIG.firebase, databaseURL: 'http://127.0.0.1:9000?ns=emulatorui' }
  : CONFIG.firebase;

export const firebaseApp = initializeApp(firebaseConfig);
export const db = isFirebase && !isLocalhost ? getFirestore(firebaseApp) : getFirestore();
export const AUTH = isLocalhost ? getAuth() : getAuth(firebaseApp);
export const storage = isLocalhost ? getStorage() : getStorage(firebaseApp);

if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
  console.log('127.0.0.1 detected!');
  connectAuthEmulator(AUTH, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}
