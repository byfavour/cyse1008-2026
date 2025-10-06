const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const Stripe = require('stripe');

try {
  admin.app();
} catch {
  admin.initializeApp();
}
const db = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

/**
 * Helper: best-effort variant match by id/sku/title/options.
 */
function findVariantIndex(variants, item) {
  if (!Array.isArray(variants) || variants.length === 0) return -1;

  const wantId = item.variantId?.toString?.() || '';
  const wantSku = (item.variantSku || '').trim();
  const wantTitle = (item.variantTitle || '').trim();

  // Try id
  if (wantId) {
    const idx = variants.findIndex((v) => (v.id?.toString?.() || '') === wantId);
    if (idx >= 0) return idx;
  }
  // Try SKU
  if (wantSku) {
    const idx = variants.findIndex((v) => (v.sku || '').trim() === wantSku);
    if (idx >= 0) return idx;
  }
  // Try title
  if (wantTitle) {
    const idx = variants.findIndex((v) => (v.title || '').trim() === wantTitle);
    if (idx >= 0) return idx;
  }

  // Try building title from options map if provided: "Size / Color"
  if (item.options && typeof item.options === 'object') {
    const built = Object.values(item.options).join(' / ');
    if (built) {
      const idx = variants.findIndex((v) => (v.title || '').trim() === built.trim());
      if (idx >= 0) return idx;
    }
  }

  return -1;
}

exports.stripeWebhook = onRequest(
  { secrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] },
  async (req, res) => {
    // Verify signature
    let event;
    try {
      const sig = req.headers['stripe-signature'];
      event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('❌ Bad signature:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Idempotency: skip if we already saw this event
    const evtRef = db.collection('stripe_events').doc(event.id);
    const seen = await evtRef.get();
    if (seen.exists) return res.json({ received: true });

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;
        if (!orderId) {
          console.warn('⚠️ session has no orderId metadata');
        } else {
          // 1) Mark order paid (merge-in stripe details)
          const orderRef = db.collection('orders').doc(orderId);
          await orderRef.set(
            {
              status: 'paid',
              paidAt: admin.firestore.FieldValue.serverTimestamp(),
              stripe: {
                sessionId: session.id,
                paymentIntentId:
                  typeof session.payment_intent === 'string'
                    ? session.payment_intent
                    : session.payment_intent?.id || null,
                amountTotal: session.amount_total,
                currency: session.currency,
              },
            },
            { merge: true }
          );

          // 2) Decrement stock using the items saved on the order
          const orderSnap = await orderRef.get();
          const order = orderSnap.data() || {};
          const items = Array.isArray(order.items) ? order.items : [];

          // Atomic updates per product
          await db.runTransaction(async (tx) => {
            for (const it of items) {
              const pid = it.id;
              const qty = Math.max(0, Number(it.quantity ?? 0));
              if (!pid || !qty) continue;

              const prodRef = db.collection('products').doc(pid);
              const prodSnap = await tx.get(prodRef);
              if (!prodSnap.exists) continue;

              const data = prodSnap.data() || {};
              const variants = Array.isArray(data.variants) ? [...data.variants] : null;

              if (variants && variants.length) {
                // Variant product
                const idx = findVariantIndex(variants, it);
                if (idx >= 0) {
                  const v = { ...variants[idx] };
                  const current = Math.max(0, Number(v.stock ?? 0));
                  v.stock = Math.max(0, current - qty);
                  variants[idx] = v;

                  // Recompute product stock as sum of variants
                  const newTotal = variants.reduce(
                    (s, vv) => s + Math.max(0, Number(vv.stock ?? 0)),
                    0
                  );

                  tx.update(prodRef, {
                    variants,
                    stock: newTotal,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  });
                } else {
                  // Couldn’t match variant — fall back to product-level stock only
                  const productCurrent = Math.max(0, Number(data.stock ?? 0));
                  const newTotal = Math.max(0, productCurrent - qty);
                  tx.update(prodRef, {
                    stock: newTotal,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                  });
                }
              } else {
                // Single-variant / no-variants product
                const productCurrent = Math.max(0, Number(data.stock ?? 0));
                const newTotal = Math.max(0, productCurrent - qty);
                tx.update(prodRef, {
                  stock: newTotal,
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
              }
            }
          });
        }
      }

      // Mark event processed
      await evtRef.set({
        type: event.type,
        created: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({ received: true });
    } catch (err) {
      console.error('❌ Webhook handler error:', err);
      return res.status(500).send('Webhook handler error');
    }
  }
);

// (Optional) keep your stock-enforcement trigger if you like the double-check.
exports.enforceProductStock = onDocumentWritten('products/{productId}', async (event) => {
  const after = event.data?.after;
  if (!after) return;
  const d = after.data() || {};
  const variants = Array.isArray(d.variants) ? d.variants : null;
  if (!variants || variants.length === 0) return;

  const sum = variants.reduce((s, v) => s + Math.max(0, Number(v.stock ?? 0)), 0);
  if (Number(d.stock ?? 0) !== sum) {
    await after.ref.update({
      stock: sum,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
});
