import { NextResponse } from 'next/server';
import admin from 'src/lib/firebase/firebase-admin';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
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
    const url = `https://${shop}/admin/api/2023-10/products.json`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: response.statusText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error', details: error.message }, { status: 500 });
  }
}
