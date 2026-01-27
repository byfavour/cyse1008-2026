export async function POST(req) {
  const body = await req.json();

  const product = {
    product: {
      title: body.title,
      body_html: body.description,
      vendor: 'Black River Market',
      variants: [{ price: body.price }],
    },
  };

  const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';

  const res = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/products.json`,
    {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    }
  );

  const data = await res.json();
  return Response.json(data);
}
