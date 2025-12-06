import { NextResponse } from 'next/server';
import { getAdmin } from 'src/lib/firebase/firebase-admin';

export async function POST(request) {
  const admin = getAdmin();
  const { userId, product } = await request.json();
  if (!userId || !product) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
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

  const payload = {
    product: {
      title: product.name,
      body_html: product.description,
      variants: product.variants.map((v) => ({
        price: v.price.toString(),
        sku: v.sku,
        option1: v.options?.Size || null,
        option2: v.options?.Color || null,
        inventory_quantity: v.quantity,
      })),
    },
  };

  const res = await fetch(`https://${shop}/admin/api/2023-10/products.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': access_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return NextResponse.json(data);
}
