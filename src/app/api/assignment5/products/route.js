import { NextResponse } from 'next/server';

import { getDb } from 'src/lib/firebase/firebase-admin';

// ─── GET /api/assignment5/products ──────────────────────────────────────────
//
// Fetches every document in the 'products' collection from Firestore,
// then loops through them to build a summary: count, total stock, total value.
//
// This is how server-side API routes talk to the database — the browser
// never touches Firestore directly; it asks our API, and our API asks the DB.
//
export async function GET() {
  const db = getDb();

  // 1. Ask Firestore for all documents in the 'products' collection
  const snapshot = await db.collection('products').get();

  // 2. Convert the snapshot into a plain array of objects we can work with
  const products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // 3. Loop through the array to calculate summary numbers
  let totalStock = 0;
  let totalValue = 0;

  for (const product of products) {
    const stock = Number(product.stock ?? 0);
    const price = Number(product.price ?? 0);

    totalStock += stock;
    totalValue += stock * price;     // value = units in stock × unit price
  }

  console.log(`[GET /api/assignment5/products] found ${products.length} products`);

  // 4. Return the summary alongside the full list
  return NextResponse.json({
    count: products.length,
    totalStock,
    totalValue: Number(totalValue.toFixed(2)),
    products: products.map((p) => ({
      id:    p.id,
      name:  p.name  || p.title || 'Untitled',
      price: Number(p.price ?? 0),
      stock: Number(p.stock ?? 0),
    })),
  });
}
