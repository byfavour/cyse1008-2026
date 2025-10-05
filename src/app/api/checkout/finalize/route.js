// app/api/checkout/finalize/route.ts
import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';

// ✅ Node runtime (Stripe needs Node, not Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import admin from 'firebase-admin';

// Initialize Admin exactly once
try {
  admin.app();
} catch {
  admin.initializeApp({
    // In dev, this picks up the emulator; in prod, use service account env
  });
}

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // 1) Verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent', 'line_items'],
    });

    // session.payment_status can be 'paid', 'unpaid'
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    // 2) Pull orderId from metadata (we put this when creating the session)
    const orderId = (session.metadata?.orderId as string) || '';
    if (!orderId) {
      return NextResponse.json({ error: 'No orderId on session' }, { status: 400 });
    }

    // 3) Update the order in Firestore (using Admin — bypasses client rules)
    const ref = db.collection('orders').doc(orderId);
    await ref.set(
      {
        status: 'paid',
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        stripe: {
          sessionId: session.id,
          paymentIntentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id,
          amountTotal: session.amount_total, // cents
          currency: session.currency,
        },
      },
      { merge: true }
    );

    // Optional: decrement stock here based on your order items, if you don’t already via webhook

    // 4) Return something for the UI
    return NextResponse.json({
      orderId,
      amount: session.amount_total,
      currency: session.currency,
    });
  } catch (err: any) {
    console.error('finalize error:', err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
