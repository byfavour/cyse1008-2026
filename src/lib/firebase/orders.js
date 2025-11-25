import { db } from './firebase';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
} from 'firebase/firestore';

const ordersCollectionRef = collection(db, 'orders');

export async function createOrderDraft({ items, total, email }) {
  const ref = doc(ordersCollectionRef);
  await setDoc(ref, { items, total, email, status: 'created', createdAt: serverTimestamp() });
  return ref.id;
}

export async function markOrderReady(id) {
  await updateDoc(doc(db, 'orders', id), { status: 'ready', readyAt: serverTimestamp() });
}

export async function getOrders() {
  const snapshot = await getDocs(ordersCollectionRef);
  return snapshot.docs.map((orderDoc) => {
    const data = orderDoc.data();
    return {
      id: orderDoc.id,
      ...data,
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt ?? null,
    };
  });
}

export async function getOrderById(id) {
  const ref = doc(db, 'orders', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt ?? null,
  };
}
