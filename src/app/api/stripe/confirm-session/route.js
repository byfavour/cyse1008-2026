// /app/api/stripe/confirm-session/route.js
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/firebase'; // your initialized Firestore (client or admin wrapper)
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });

    // 1) Look up the Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items.data.price.product'],
    });

    const paid =
      session.status === 'complete' &&
      (session.payment_status === 'paid' || session.payment_intent?.status === 'succeeded');

    // 2) If we have an orderId in metadata, ensure the order exists/updated
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const ref = doc(db, 'orders', orderId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // Create a minimal order doc (dev fallback)
        await setDoc(ref, {
          status: paid ? 'paid' : 'pending',
          email: session.customer_details?.email || session.customer_email || null,
          currency: session.currency,
          amountTotal: session.amount_total,
          createdAt: serverTimestamp(),
          stripe: {
            sessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id || null,
          },
        });
      } else if (paid && snap.data().status !== 'paid') {
        await updateDoc(ref, {
          status: 'paid',
          paidAt: serverTimestamp(),
          stripe: {
            sessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id || null,
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      paid,
      orderId: orderId || null,
      amount: session.amount_total,
      currency: session.currency,
    });
  } catch (err) {
    console.error('confirm-session error', err);
    return NextResponse.json({ error: err.message || 'Stripe error' }, { status: 400 });
  }
}
