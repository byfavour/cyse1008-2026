// app/api/stripe/create-session/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const { items, orderId, email } = await req.json();

    if (!Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: 'No items' }, { status: 400 });
    }

    const line_items = items.map((i: any) => ({
      quantity: Number(i.quantity ?? 1),
      price_data: {
        currency: 'cad',
        unit_amount: Math.round(Number(i.price ?? 0) * 100), // dollars -> cents
        product_data: {
          name: i.name || 'Item',
          metadata: { productId: i.id ?? '' },
        },
      },
    }));

    const successUrl =
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3032'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl =
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3032'}/checkout/cancel`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      line_items,
      metadata: { orderId },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error('create-session error:', err);
    return NextResponse.json({ error: err.message || 'Stripe error' }, { status: 400 });
  }
}
