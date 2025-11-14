TODO:

- checkout process integrated with stripe
- improve efficiency - seems slow - make it faster
- cart is holding onto items; maybe because the order isn't flipping to paid
- simplify addresses in checkout
- streamline payment options in checkout
  checkout
  zomato
  blinkit zip 560029
  smmlite payments email address confirmation
  UBI
  razorpay indian payments

## Stripe CLI Install (host machine)
1. Download the latest Linux tarball from GitHub.
2. Unzip: `tar -xvf stripe_X.X.X_linux_x86_64.tar.gz`.
3. Move the `stripe` binary into your PATH:
   ```
   sudo mv stripe /usr/local/bin/
   ```

## Stripe + Firebase Emulator Troubleshooting Checklist

### 1. Stripe CLI Listener
- Run from a terminal with internet access (outside VS Code sandbox):
  ```
  stripe listen --events checkout.session.completed \
    --forward-to http://127.0.0.1:5001/quilt-b3dec/us-central1/stripeWebhook
  ```
- Leave the CLI session running and watch for `→ checkout.session.completed` / `← 200 POST …`.
- Every time you start the listener, copy the printed `whsec_…` into `functions/.env` or Firebase Secret Manager (and any local `.env` files). Restart `npm run dev` so the emulator reloads the secret.

### 2. Firebase Functions Emulator
- Run `npm run dev` from a shell using Node 20 (`node -v` should show 20.x).
- Confirm the emulator logs `functions[us-central1-stripeWebhook]: http function initialized (http://127.0.0.1:5001/…)`. If the port changes, update the listener `--forward-to` URL.
- Tail `firebase-debug.log`; look for:
  - `stripeWebhook: received with signature` (success)
  - `Webhook signature verification failed` (secret mismatch or stale listener)

### 3. Secret Management
- Secrets come from Firebase Secret Manager (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`). Update them with:
  ```
  firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
  firebase functions:secrets:set STRIPE_SECRET_KEY
  ```
  (Paste the current `whsec_…` or `sk_test_…` values.)
- If you use local `.env` files instead, make sure every copy matches and restart the emulator.

### 4. Common Issues & Fixes
- **Signature mismatch**: listener secret doesn’t match. Update secrets and restart.
- **404 in Stripe CLI output**: wrong port; copy the URL from the emulator log.
- **`Cannot read properties of undefined (serverTimestamp)`**: import `FieldValue` from `firebase-admin/firestore`.
- **No CLI output**: listener crashed or network blocked; restart `stripe listen`.
- **CLI `socket: operation not permitted`**: run the CLI on the host OS (not inside the restricted shell).

### 5. Verification
- After checkout, use the Firestore Emulator UI (`http://127.0.0.1:4000/firestore`) to confirm `orders/{orderId}` now shows `status: paid`.
- Check `stripe_events/{eventId}` for idempotency records.
- You can simulate events quickly with: `stripe trigger checkout.session.completed`.

Share this checklist with students; walking through each item resolves the “order stuck as pending” flow almost every time.
