import { NextResponse } from 'next/server';
import { getAdmin } from 'src/lib/firebase/firebase-admin';
import { normalizeShopifyProduct } from 'src/lib/shopify/normalize';

export const runtime = 'nodejs';

export async function GET(request) {
  const admin = getAdmin();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('uid');

  if (!userId) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
  }

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

  try {
    const res = await fetch(`https://${shop}/admin/api/2023-10/products.json`, {
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json();
    const normalized = data.products.map(normalizeShopifyProduct);

    return NextResponse.json(normalized, { status: 200 });
  } catch (error) {
    console.error('❌ Shopify fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
