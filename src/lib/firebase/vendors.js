import {
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';

import { db } from './firebase';

const vendorsCollectionRef = collection(db, 'vendors');

export async function addVendor(data) {
  const payload = {
    ...data,
    isActive: typeof data?.isActive === 'boolean' ? data.isActive : true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(vendorsCollectionRef, payload);
  return docRef.id;
}

export async function updateVendor(id, data) {
  const vendorDocRef = doc(db, 'vendors', id);
  const payload = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  await updateDoc(vendorDocRef, payload);
}

export async function deleteVendor(id) {
  const vendorDocRef = doc(db, 'vendors', id);
  await deleteDoc(vendorDocRef);
}

export async function getVendors(filter = {}) {
  let vendorsQuery = vendorsCollectionRef;
  if (filter.ownerId) {
    vendorsQuery = query(vendorsQuery, where('ownerId', '==', filter.ownerId));
  }
  const snapshot = await getDocs(vendorsQuery);
  return snapshot.docs.map((_doc) => {
    const data = _doc.data() || {};
    return {
      id: _doc.id,
      ...data,
      isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
    };
  });
}

export async function getVendorById(id) {
  const ref = doc(db, 'vendors', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error(`Vendor ${id} not found`);
  return { id, ...snap.data() };
}
