import Stripe from 'stripe';
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { items, orderId, email } = await req.json();

  const line_items = items.map((i) => ({
    price_data: {
      currency: 'usd',
      product_data: { name: i.name },
      unit_amount: Math.round(i.price * 100),
    },
    quantity: i.qty,
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
}
