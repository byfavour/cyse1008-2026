import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Read the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    const paid =
      session.status === 'complete' &&
      (session.payment_status === 'paid' ||
        (typeof session.payment_intent === 'object' &&
          session.payment_intent?.status === 'succeeded'));

    return NextResponse.json({
      ok: true,
      paid,
      status: session.status,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      orderId: session.metadata?.orderId ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Stripe error' }, { status: 400 });
  }
}
