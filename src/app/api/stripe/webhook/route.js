import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import admin, { db } from 'src/lib/firebase/firebase-admin';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const secret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const sig = req.headers.get('stripe-signature');
  const buf = Buffer.from(await req.arrayBuffer());

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await db.collection('orders').doc(orderId).update({
        status: 'paid',
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
        stripeSessionId: session.id,
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
