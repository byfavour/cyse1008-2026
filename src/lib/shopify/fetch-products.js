'use client';
import { getAuth } from 'firebase/auth';

export async function fetchShopifyProducts() {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error('User not logged in');

  const res = await fetch(`/api/shopify/fetch?userId=${uid}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Invalid JSON:', e);
    return null;
  }
}
