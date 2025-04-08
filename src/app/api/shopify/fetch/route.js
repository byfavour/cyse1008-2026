import { NextResponse } from 'next/server';
import admin from 'src/lib/firebase/firebase-admin';
import { normalizeShopifyProduct } from 'src/lib/shopify/normalize';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const tokenDoc = await admin
    .firestore()
    .collection('users')
    .doc(userId)
    .collection('tokens')
    .doc('shopify')
    .get();

  if (!tokenDoc.exists) {
    return NextResponse.json({ error: 'Shopify token not found' }, { status: 404 });
  }

  const { access_token, shop } = tokenDoc.data();
  const response = await fetch(`https://${shop}/admin/api/2023-10/products.json`, {
    headers: {
      'X-Shopify-Access-Token': access_token,
      'Content-Type': 'application/json',
    },
  });

  const { products } = await response.json();
  const normalized = products.map(normalizeShopifyProduct);
  return NextResponse.json(normalized);
}
