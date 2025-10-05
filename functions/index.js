const admin = require('firebase-admin');
const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const Stripe = require('stripe');

admin.initializeApp();

exports.handleStripeWebhook = onRequest(
  { secrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'] },
  async (req, res) => {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });

      const sig = req.headers['stripe-signature'];
      const event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object;

        // Example split transfers (replace with your logic)
        const vendorSplits = [
          { id: 'acct_vendor1', amount: 400 },
          { id: 'acct_vendor2', amount: 300 },
        ];

        await Promise.all(
          vendorSplits.map((split) =>
            stripe.transfers.create({
              amount: split.amount,
              currency: 'cad',
              destination: split.id,
              transfer_group: intent?.metadata?.transfer_group,
            })
          )
        );
      }

      res.sendStatus(200);
    } catch (err) {
      console.error('Stripe webhook error:', err);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

/**
 * Keep product.stock in sync with sum(variants[].stock).
 * Tolerates legacy `quantity` on variants.
 */
exports.enforceProductStock = onDocumentWritten('products/{productId}', async (event) => {
  const afterSnap = event.data?.after;
  if (!afterSnap) return; // deleted

  const data = afterSnap.data() || {};
  const variants = Array.isArray(data.variants) ? data.variants : [];

  const computed = variants.reduce((sum, v) => {
    const val = Number(v?.stock ?? v?.quantity ?? 0);
    return sum + (Number.isFinite(val) ? Math.max(0, val) : 0);
  }, 0);

  const current = Number(data.stock ?? 0);
  if (current !== computed) {
    await afterSnap.ref.update({
      stock: computed,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
});
