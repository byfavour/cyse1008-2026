// src/lib/firebase/images.js

import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// top‑level “images” collection
const imagesCollectionRef = collection(db, 'images');

/**
 * Save one image‑metadata record to Firestore.
 *
 * @param {{
 *   imageUrl: string,
 *   filePath: string,
 *   uploadedBy: string,
 *   associatedEntityId?: string | null
 * }} imageData
 * @returns {Promise<string>} the new document’s ID
 */
export async function saveImageMeta(imageData) {
  try {
    const payload = {
      ...imageData,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(imagesCollectionRef, payload);
    return docRef.id;
  } catch (error) {
    console.error('Error saving image metadata:', error);
    throw error;
  }
}

/**
 * List all image‑metadata records, newest first.
 * @returns {Promise<Array<{ id: string, imageUrl: string, filePath: string, uploadedBy: string, associatedEntityId?: string, createdAt: any }>>}
 */
export async function listImageMeta() {
  try {
    const q = query(imagesCollectionRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error listing image metadata:', error);
    throw error;
  }
}
