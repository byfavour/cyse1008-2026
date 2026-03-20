import { NextResponse } from 'next/server';

// ─── POST /api/assignment5/callback ─────────────────────────────────────────
//
// A "callback" route is one that an EXTERNAL service calls to notify us of an
// event — we don't initiate it, they do.  Stripe uses exactly this pattern:
// after a payment succeeds, Stripe sends a POST to /api/stripe/webhook.
//
// This demo simulates that pattern.  Our page calls this route as if it were
// Stripe telling us "payment completed".
//
export async function POST(req) {
  try {
    const event = await req.json();   // the "event" payload the caller sent us

    console.log('[CALLBACK] event received =', event);

    // In a real payment webhook we would:
    //   1. Verify the signature to confirm the request really came from Stripe
    //   2. Read event.type to decide what happened
    //   3. Update our database (mark order as paid, reduce stock, etc.)

    const eventType = event.type || 'unknown';
    const orderId   = event.orderId || 'n/a';

    let responseMessage = 'Event noted';
    if (eventType === 'payment.completed') {
      responseMessage = `Order ${orderId} marked as paid — stock updated`;
    }

    return NextResponse.json({
      received: true,
      eventType,
      orderId,
      message: responseMessage,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CALLBACK] error =', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
