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
  try {
    const db = getDb();

    // Changed from 'products' to 'vendors'
    const snapshot = await db.collection('vendors').get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Changed to count active vendors instead of stock
    let activeCount = 0;
    for (const item of items) {
      if (item.isActive === true) {
        activeCount += 1;
      }
    }

    console.log(`[GET /api/assignment5/partC] found ${items.length} items`);

    return NextResponse.json({
      count: items.length,
      activeCount,  // Added activeCount field
      items: items.map((i) => ({
        id:   i.id,
        name: i.name || 'Untitled',
      })),
    });
  } catch (error) {
    console.error('[GET /api/assignment5/partC] error =', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}