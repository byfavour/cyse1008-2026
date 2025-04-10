/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();
// const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

exports.handleStripeWebhook = onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;

    // Split transfer logic
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
          transfer_group: intent.metadata.transfer_group,
        })
      )
    );
  }

  res.sendStatus(200);
});
