'use server';

import { notFound } from 'next/navigation';
import { CONFIG } from 'src/config-global';
import { getAdmin } from 'src/lib/firebase/firebase-admin';

import { OrderDetailsView } from 'src/sections/order/view';

export default async function Page({ params }) {
  const { id } = params;

  const admin = getAdmin();
  const snap = await admin.firestore().collection('orders').doc(id).get();

  if (!snap.exists) {
    return notFound();
  }

  const data = snap.data();
  const currentOrder = {
    id: snap.id,
    ...data,
    createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt ?? null,
  };

  return <OrderDetailsView order={currentOrder} />;
}

// ----------------------------------------------------------------------

/**
 * Static Exports Handling
 * Next.js 15 no longer supports `dynamic`, so we use `generateStaticParams()`
 */
export async function generateStaticParams() {
  return CONFIG.isStaticExport ? [] : [];
}
