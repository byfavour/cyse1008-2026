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
  // In GitHub Codespaces every port is reachable via a forwarded hostname,
  // not via localhost. Detect Codespaces and build the correct base URL.
  const codespaceName = process.env.NEXT_PUBLIC_CODESPACE_NAME;
  const codespaceHost = codespaceName
    ? `${codespaceName}.app.github.dev`
    : null;

  const authUrl = codespaceHost
    ? `https://${codespaceName}-9099.${codespaceHost.split('.').slice(1).join('.')}`
    : 'http://127.0.0.1:9099';
  const firestoreHost = codespaceHost ? `${codespaceName}-8080.app.github.dev` : '127.0.0.1';
  const firestorePort = codespaceHost ? 443 : 8080;
  const storageHost = codespaceHost ? `${codespaceName}-9199.app.github.dev` : '127.0.0.1';
  const storagePort = codespaceHost ? 443 : 9199;

  console.log('Connecting to Firebase emulators...', codespaceHost ? '(Codespaces)' : '(local)');

  connectAuthEmulator(AUTH, authUrl, { disableWarnings: true });
  connectFirestoreEmulator(db, firestoreHost, firestorePort);
  connectStorageEmulator(storage, storageHost, storagePort);
}
