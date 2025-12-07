import Stripe from 'stripe';
import { NextResponse } from 'next/server';

import { getDb } from 'src/lib/firebase/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
});

function normalizeItems(items = [], currency = 'usd') {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((item) => ({
    quantity: Math.max(1, Number(item?.quantity ?? 1)),
    price_data: {
      currency,
      unit_amount: Math.round(Number(item?.price ?? item?.amount ?? 0) * 100),
      product_data: {
        name: item?.name || item?.title || 'Item',
        metadata: {
          productId: item?.id ?? '',
          variantId: item?.variantId ?? '',
          variantSku: item?.variantSku ?? '',
          variantTitle: item?.variantTitle ?? '',
        },
      },
    },
  }));
}

export async function POST(request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const db = getDb();
    const snap = await db.collection('orders').doc(orderId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const data = snap.data() || {};
    const currency = (data.currency || 'usd').toString().toLowerCase();
    const line_items = normalizeItems(data.items, currency);

    const total = Number(data.total ?? data.subtotal ?? 0);
    const fallbackItem =
      line_items.length === 0 && Number.isFinite(total)
        ? [
            {
              quantity: 1,
              price_data: {
                currency,
                unit_amount: Math.round(total * 100),
                product_data: {
                  name: data.orderNumber ? `Order ${data.orderNumber}` : 'Order payment',
                },
              },
            },
          ]
        : [];

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: data.email || undefined,
      line_items: line_items.length ? line_items : fallbackItem,
      metadata: { orderId },
      payment_intent_data: { metadata: { orderId } },
      success_url: `${baseUrl}/checkout/success?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel?order=${orderId}`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('payment-link error:', error);
    return NextResponse.json({ error: error?.message || 'Stripe error' }, { status: 400 });
  }
}
