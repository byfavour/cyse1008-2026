import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
});

// in /app/api/stripe/create-session/route.(ts|js)
const acct = await stripe.accounts.retrieve();
console.log('CREATE-SESSION using account:', acct.id);

export async function POST(req) {
  try {
    const { items, orderId, email } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items' }, { status: 400 });
    }

    const line_items = items.map((i) => ({
      quantity: Number(i.quantity ?? 1),
      price_data: {
        currency: 'cad',
        unit_amount: Math.round(Number(i.price ?? 0) * 100),
        product_data: {
          name: i.name || 'Item',
          metadata: {
            productId: i.id ?? '',
            variantId: i.variantId ?? '',
            variantSku: i.variantSku ?? '',
            variantTitle: i.variantTitle ?? '',
          },
        },
      },
    }));

    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3032';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items,
      metadata: { orderId }, // webhook reads this
      success_url: `${base}/checkout/success?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/cancel`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('create-session error:', err);
    return NextResponse.json({ error: err?.message || 'Stripe error' }, { status: 400 });
  }
}
