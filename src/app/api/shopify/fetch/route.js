import { NextResponse } from 'next/server';

// Optional runtime override if you prefer Node over the Edge runtime
export const runtime = 'nodejs';

export async function GET() {
  // 1) Read environment variables
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminToken = process.env.SHOPIFY_ADMIN_TOKEN;

  if (!storeDomain || !adminToken) {
    return NextResponse.json(
      { error: 'Shopify environment variables not configured' },
      { status: 500 }
    );
  }

  try {
    // 2) Construct the Shopify Admin API URL
    // For example, listing products:
    // https://<STORE_DOMAIN>/admin/api/2023-10/products.json
    const url = `https://${storeDomain}/admin/api/2023-10/products.json`;

    // 3) Make the request to Shopify
    const shopifyResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': adminToken,
        'Content-Type': 'application/json',
      },
      // If you want to ensure no caching in Next, you can do:
      // next: { revalidate: 0 },
    });

    // 4) Check for response errors
    if (!shopifyResponse.ok) {
      // Return whatever status Shopify gave, or handle it differently if desired
      return NextResponse.json(
        { error: `Shopify API error: ${shopifyResponse.statusText}` },
        { status: shopifyResponse.status }
      );
    }

    // 5) Parse and return the JSON data
    const data = await shopifyResponse.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return NextResponse.json({ error: 'Failed to fetch Shopify products' }, { status: 500 });
  }
}
