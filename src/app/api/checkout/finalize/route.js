import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { getAdmin, getDb } from 'src/lib/firebase/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2023-10-16' });

export async function POST(req) {
  try {
    const admin = getAdmin();
    const db = getDb();

    const { session_id } = await req.json();
    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent', 'line_items'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const orderId = (session.metadata && session.metadata.orderId) || '';
    if (!orderId) {
      return NextResponse.json({ error: 'No orderId on session' }, { status: 400 });
    }

    await db
      .collection('orders')
      .doc(orderId)
      .set(
        {
          status: 'paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          stripe: {
            sessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id,
            amountTotal: session.amount_total,
            currency: session.currency,
          },
        },
        { merge: true }
      );

    return NextResponse.json({
      orderId,
      amount: session.amount_total,
      currency: session.currency,
    });
  } catch (err) {
    console.error('finalize error:', err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
