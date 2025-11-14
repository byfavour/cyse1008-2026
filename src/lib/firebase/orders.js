import { db } from './firebase';
import { doc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';

export async function createOrderDraft({ items, total, email }) {
  const ref = doc(collection(db, 'orders'));
  await setDoc(ref, { items, total, email, status: 'created', createdAt: serverTimestamp() });
  return ref.id;
}

export async function markOrderReady(id) {
  await updateDoc(doc(db, 'orders', id), { status: 'ready', readyAt: serverTimestamp() });
}
