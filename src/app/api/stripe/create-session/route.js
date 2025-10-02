import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { items, orderId, email } = await req.json();

    // items = [{ id, name, price, quantity }]
    const line_items = items.map((i) => ({
      price_data: {
        currency: 'cad',
        product_data: {
          name: i.name,
          metadata: { productId: i.id },
        },
        // Stripe expects cents
        unit_amount: Math.round(Number(i.price) * 100),
      },
      quantity: i.quantity ?? 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/product/checkout?success=1&order=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/product/checkout?canceled=1&order=${orderId}`,
      metadata: { orderId, email },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('create-session error', err);
    return NextResponse.json({ error: 'Unable to create session' }, { status: 500 });
  }
}
