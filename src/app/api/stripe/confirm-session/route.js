// /app/api/stripe/confirm-session/route.ts (or .js)
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

// --- Firebase Admin (server-side, bypasses rules)
import admin from 'firebase-admin';
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // 1) Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items.data.price.product'],
    });

    const paid =
      session.status === 'complete' &&
      (session.payment_status === 'paid' || session.payment_intent?.status === 'succeeded');

    // 2) Reconcile order as a fallback (webhook is the source of truth)
    const orderId = session.metadata?.orderId ?? null;
    if (orderId) {
      const ref = db.collection('orders').doc(orderId);
      const snap = await ref.get();

      if (!snap.exists) {
        // dev fallback — create a minimal record
        await ref.set({
          status: paid ? 'paid' : 'pending',
          email: session.customer_details?.email ?? session.customer_email ?? null,
          currency: session.currency,
          amountTotal: session.amount_total,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          stripe: {
            sessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : (session.payment_intent?.id ?? null),
          },
        });
      } else if (paid && snap.data()?.status !== 'paid') {
        await ref.update({
          status: 'paid',
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          stripe: {
            sessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : (session.payment_intent?.id ?? null),
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      paid,
      status: session.status,
      payment_status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      orderId,
    });
  } catch (err) {
    console.error('confirm-session error', err);
    return NextResponse.json({ error: err.message ?? 'Stripe error' }, { status: 400 });
  }
}
