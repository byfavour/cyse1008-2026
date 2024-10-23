import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const isFirebase = CONFIG.auth.method === 'firebase';

export const firebaseApp = isFirebase ? initializeApp(CONFIG.firebase) : {};

export const AUTH = isFirebase ? getAuth(firebaseApp) : {};

export const FIRESTORE = isFirebase ? getFirestore(firebaseApp) : {};

export const storage = getStorage(firebaseApp);
