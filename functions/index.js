// functions/index.js
const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

// --- Firebase init (safe on emulator and prod)
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// --- Stripe lazy init (reads STRIPE_SECRET_KEY from functions/.env)
let stripeInstance = null;
function getStripe() {
  if (stripeInstance) return stripeInstance;
  const Stripe = require('stripe');
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set (put it in functions/.env)');
  stripeInstance = new Stripe(key, { apiVersion: '2023-10-16' });
  return stripeInstance;
}

// ---------- helpers ----------
function toStr(x) {
  return x === undefined || x === null ? '' : String(x);
}
function trimStr(x) {
  return toStr(x).trim();
}

/**
 * Best-effort variant match by id/sku/title/options
 * item may carry: variantId, variantSku, variantTitle, options (map)
 */
function findVariantIndex(variants, item) {
  if (!Array.isArray(variants) || variants.length === 0) return -1;

  const wantId = trimStr(item && item.variantId);
  const wantSku = trimStr(item && item.variantSku);
  const wantTitle = trimStr(item && item.variantTitle);

  // Try by id
  if (wantId) {
    const idx = variants.findIndex((v) => trimStr(v && v.id) === wantId);
    if (idx >= 0) return idx;
  }
  // Try by SKU
  if (wantSku) {
    const idx = variants.findIndex((v) => trimStr(v && v.sku) === wantSku);
    if (idx >= 0) return idx;
  }
  // Try by title
  if (wantTitle) {
    const idx = variants.findIndex((v) => trimStr(v && v.title) === wantTitle);
    if (idx >= 0) return idx;
  }
  // Try building title from options map: "Size / Color"
  const opts = item && item.options && typeof item.options === 'object' ? item.options : null;
  if (opts) {
    const built = Object.keys(opts)
      .map((k) => trimStr(opts[k]))
      .filter(Boolean)
      .join(' / ');
    if (built) {
      const idx = variants.findIndex((v) => trimStr(v && v.title) === built);
      if (idx >= 0) return idx;
    }
  }
  return -1;
}

// ---------- STRIPE WEBHOOK ----------
exports.stripeWebhook = onRequest(
  { secrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] },
  async (req, res) => {
    console.log(
      'stripeWebhook: received',
      req.headers['stripe-signature'] ? 'with signature' : 'no signature'
    );
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const stripe = getStripe();

    // 1) Verify signature
    let event;
    try {
      const sig = req.headers['stripe-signature'];
      console.log('stripeWebhook secret:', process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 20));
      event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err && err.message);
      return res.status(400).send(`Webhook Error: ${err && err.message}`);
    }

    // 2) Idempotency: skip if already processed
    const evtRef = db.collection('stripe_events').doc(event.id);
    const seen = await evtRef.get();
    if (seen.exists) return res.json({ received: true, duplicate: true });

    try {
      // 3) Handle event(s) you care about
      if (event.type === 'checkout.session.completed') {
        const session = (event.data && event.data.object) || {};
        const metadata = session.metadata || {};
        const orderId = metadata.orderId;

        if (orderId) {
          // 3a) Mark order "paid"
          const orderRef = db.collection('orders').doc(orderId);
          await orderRef.set(
            {
              status: 'paid',
              paidAt: FieldValue.serverTimestamp(),
              stripe: {
                sessionId: session.id || null,
                paymentIntentId:
                  typeof session.payment_intent === 'string'
                    ? session.payment_intent
                    : (session.payment_intent && session.payment_intent.id) || null,
                amountTotal: session.amount_total || null,
                currency: session.currency || null,
              },
            },
            { merge: true }
          );

          // 3b) Decrement stock from order.items
          const orderSnap = await orderRef.get();
          const order = orderSnap.exists ? orderSnap.data() : {};
          const items = Array.isArray(order.items) ? order.items : [];

          await db.runTransaction(async (tx) => {
            for (let i = 0; i < items.length; i += 1) {
              const it = items[i] || {};
              const productId = trimStr(it.id);
              const qty = Math.max(0, Number(it.quantity || 0));
              if (!productId || !qty) continue;

              const prodRef = db.collection('products').doc(productId);
              const prodSnap = await tx.get(prodRef);
              if (!prodSnap.exists) continue;

              const data = prodSnap.data() || {};
              const variants = Array.isArray(data.variants) ? data.variants.slice() : [];

              if (variants.length) {
                const idx = findVariantIndex(variants, it);
                if (idx >= 0) {
                  const v = Object.assign({}, variants[idx]);
                  const current = Math.max(0, Number(v.stock || 0));
                  v.stock = Math.max(0, current - qty);
                  variants[idx] = v;

                  const sum = variants.reduce(
                    (s, vv) => s + Math.max(0, Number((vv && vv.stock) || 0)),
                    0
                  );

                  tx.update(prodRef, {
                    variants,
                    stock: sum,
                    updatedAt: FieldValue.serverTimestamp(),
                  });
                } else {
                  // Fallback: just adjust product-level stock
                  const current = Math.max(0, Number(data.stock || 0));
                  tx.update(prodRef, {
                    stock: Math.max(0, current - qty),
                    updatedAt: FieldValue.serverTimestamp(),
                  });
                }
              } else {
                // No variants -> product-level stock only
                const current = Math.max(0, Number(data.stock || 0));
                tx.update(prodRef, {
                  stock: Math.max(0, current - qty),
                  updatedAt: FieldValue.serverTimestamp(),
                });
              }
            }
          });
        } else {
          console.warn('checkout.session.completed without orderId metadata');
        }
      }

      // 4) Mark Stripe event processed
      await evtRef.set({
        type: event.type,
        created: FieldValue.serverTimestamp(),
      });

      return res.json({ received: true });
    } catch (err) {
      console.error('Webhook handler error:', err);
      return res.status(500).send('Webhook handler error');
    }
  }
);

// ---------- ENFORCE PRODUCT STOCK (variants sum) ----------
exports.enforceProductStock = onDocumentWritten('products/{productId}', async (event) => {
  const after = event.data && event.data.after ? event.data.after : null;
  if (!after) return;

  const d = after.data() || {};
  const variants = Array.isArray(d.variants) ? d.variants : [];
  if (!variants.length) return;

  const sum = variants.reduce((s, v) => s + Math.max(0, Number((v && v.stock) || 0)), 0);

  if (Number(d.stock || 0) !== sum) {
    await after.ref.update({
      stock: sum,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
});
