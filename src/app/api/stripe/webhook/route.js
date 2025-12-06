import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getAdmin, getDb } from 'src/lib/firebase/firebase-admin';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const secret = process.env.STRIPE_WEBHOOK_SECRET;

// Required to read the raw body in App Router route handlers:
export const config = { api: { bodyParser: false } };

export async function POST(req) {
  try {
    const admin = getAdmin();
    const db = getDb();

    const sig = req.headers.get('stripe-signature');
    const buf = Buffer.from(await req.arrayBuffer());

    let event;
    try {
      console.log('stripeWebhook secret:', process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 8));

      event = stripe.webhooks.constructEvent(buf, sig, secret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
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
  } catch (err) {
    console.error('Webhook handler error', err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
