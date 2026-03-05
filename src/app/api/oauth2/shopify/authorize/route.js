import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  const userId = searchParams.get('userId');

  if (!shop || !userId) {
    return NextResponse.json({ error: 'Missing shop or userId' }, { status: 400 });
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const redirectUri = process.env.SHOPIFY_OAUTH2_REDIRECT_URI;
  const scopes = process.env.SHOPIFY_SCOPES;

  const authUrl =
    `https://${shop}/admin/oauth/authorize?client_id=${clientId}` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scopes}&state=${userId}`;

  return NextResponse.redirect(authUrl);
}
