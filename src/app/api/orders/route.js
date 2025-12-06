import { NextResponse } from 'next/server';

import { getDb } from 'src/lib/firebase/firebase-admin';

function toDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000);
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function GET() {
  const db = getDb();

  const snap = await db.collection('orders').orderBy('createdAt', 'desc').get();

  const orders = snap.docs.map((doc) => {
    const data = doc.data() || {};
    const items = Array.isArray(data.items) ? data.items : [];
    const subtotal = Number(data.subtotal ?? data.total ?? 0);
    const totalQuantity = items.reduce((acc, item) => acc + Number(item?.quantity || 0), 0);

    return {
      id: doc.id,
      orderNumber: data.orderNumber || doc.id.slice(-6),
      customer: data.customer || { name: data.email || 'Customer' },
      email: data.email || '',
      items,
      subtotal,
      totalAmount: subtotal,
      totalQuantity,
      status: data.status || 'pending',
      currency: data.currency || 'USD',
      createdAt: toDate(data.createdAt),
      paidAt: toDate(data.paidAt),
    };
  });

  return NextResponse.json({ orders });
}
