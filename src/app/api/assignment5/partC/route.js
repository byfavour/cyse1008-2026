import { NextResponse } from 'next/server';

import { getDb } from 'src/lib/firebase/firebase-admin';

// ─── Part C — your task ──────────────────────────────────────────────────────
//
// This route is a starting point copied from the products route.
// Your job is to make TWO small changes:
//
//   1. Change the Firestore collection from 'products' to 'vendors'
//   2. Change the summary fields to match vendor data
//      (hint: vendors have 'name' and 'isActive' — count how many are active)
//
// When you are done, call this route from the assignment5 page and log the result.
//
// ─────────────────────────────────────────────────────────────────────────────

export async function GET() {
  const db = getDb();

  // TODO: change 'products' to 'vendors'
  const snapshot = await db.collection('products').get();

  const items = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // TODO: change this loop to count active vendors instead of stock/value
  let totalStock = 0;
  for (const item of items) {
    totalStock += Number(item.stock ?? 0);
  }

  console.log(`[GET /api/assignment5/partC] found ${items.length} items`);

  return NextResponse.json({
    count: items.length,
    totalStock,
    // TODO: add an 'activeCount' field here
    items: items.map((i) => ({
      id:   i.id,
      name: i.name || 'Untitled',
    })),
  });
}
