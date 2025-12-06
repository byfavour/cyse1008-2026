import { NextResponse } from 'next/server';
import { getAdmin } from 'src/lib/firebase/firebase-admin';

export async function GET(request) {
  try {
    const admin = getAdmin();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');
    const userId = searchParams.get('state');

    if (!code || !shop || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.json({ error: 'Token exchange failed', tokenData }, { status: 400 });
    }

    await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('tokens')
      .doc('shopify')
      .set({
        shop,
        access_token: tokenData.access_token,
        scope: tokenData.scope,
        created_at: Date.now(),
      });

    const baseUrl = process.env.BASE_URL || request.nextUrl.origin;
    const redirectUrl = `${baseUrl}/dashboard/vendor?provider=shopify&status=success`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Unexpected error', details: error.message },
      { status: 500 }
    );
  }
}
