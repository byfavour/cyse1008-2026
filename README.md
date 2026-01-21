## Clean-up roadmap

1. ✅ Remove unused dashboard modules (blog, job, tour, invoice, calendar, chat, mail, kanban, general analytics widgets) and their routes/nav entries.
2. ✅ Strip unused mock data, demo components, and sample API routes unrelated to product/vendor/order flows.
3. ✅ Remove extra auth providers and demo flows you won’t use (Amplify/Auth0/Supabase/Auth Demo variants).
4. ✅ Prune front-end pages not part of the public shop experience (landing demos, components gallery, etc.).
5. ✅ Simplify layout/navigation to only show shop, checkout, vendor, product, and orders.
6. 🔄 After each slice, run `npm run dev` to verify the remaining flows still work.

Launch checklist (target: Friday, single-product Stripe checkout):

1. Product setup

- Seed one live product (name, price, image) and lock creation/edit to owner only.
- Add a tiny seeding script for the emulator to avoid empty shop during dev.

2. Payments (Stripe only)

- Confirm payment flow uses Stripe card only (no placeholders) and copy matches the card form.
- Verify test checkout end-to-end: order creation -> Stripe session -> webhook -> order status paid -> cart cleared.
- Configure Stripe webhook endpoints: test (staging) + live; store secrets per env.

3. Environments

- Create .env.local (emulators + test keys), .env.test (staging project), .env.production (prod project).
- Ensure Firebase SDK picks emulators in dev; staging/prod point to their Firebase projects.
- Add an env checklist section documenting required vars (Stripe, Firebase, Shopify if used).

4. Orders and dashboard

- Hook “View orders” CTAs to dashboard orders (done).
- Show payment status on order detail; ensure refunds/cancellations display correctly (can defer post-launch).

5. QA before launch

- Run smoke: add single product -> checkout with Stripe test card -> see paid order in dashboard -> email/notifications optional.
- Check Firestore rules for least privilege; storage rules for uploads.
- Enable basic logging/alerts for failed functions/webhooks.

Environment setup (staging/prod)

- [x] Create Firebase projects: `black-river-market-staging` (staging) and `black-river-market` (prod).
- [x] Update `.firebaserc` aliases: set `default` -> staging, add `prod` -> `black-river-market`.
- [x] Env files: `.env.local` (emulators + test keys), `.env.black-river-market-staging` (staging keys), `.env.black-river-market` (prod keys).
- [x] Stripe webhooks: create staging endpoint (store secret in `.env.test`/Secrets) and prod endpoint (store secret in `.env.production`/Secrets).
- [ ] Deploy commands: `firebase use staging && firebase deploy --only functions,hosting`; prod: `firebase use prod && firebase deploy --only functions,hosting`.

### Environment procedures (dev/staging/prod)

- Dev (emulators): `npm run dev` ⇒ loads `.env.development` via `dotenv-cli`; --keep Stripe/Firebase test keys here. Start Functions/Firestore emulators automatically via `dev:emulators`.
- Staging build/run: `npm run build:staging` or `npm run start:staging` ⇒ loads `.env.black-river-market-staging`.
- Prod build/run: `npm run build:prod` or `npm run start:prod` ⇒ loads `.env.black-river-market` (prod).
- Deploy hosting/functions: set the Firebase alias first (`firebase use staging` or `firebase use prod`), then `firebase deploy` (or the existing `deploy:*` scripts). Env vars for deployed functions still come from Secret Manager, not these `.env` files.
- Functions secrets: keep Stripe secrets in Secret Manager only. Staging: `firebase functions:secrets:set STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET --project black-river-market-staging`; Prod: same with `--project black-river-market`.

### Hosting deploy commands (Next.js 16 + webpack)

- Staging hosting deploy (forces webpack build):  
  ```bash
  FIREBASE_FRAMEWORKS_BUILD_COMMAND="npm run build:staging" firebase deploy --project black-river-market-staging
  ```
- Prod hosting deploy (forces webpack build):  
  ```bash
  FIREBASE_FRAMEWORKS_BUILD_COMMAND="npm run build:prod" firebase deploy --project black-river-market
  ```
- If framework caches get in the way, clear them first:  
  ```bash
  rm -rf .firebase/black-river-market-staging .firebase/hosting.cHVibGlj.cache .firebase/hosting.LmZpcmViYXNlL2JsYWNrLXJpdmVyLW1hcmtldC1zdGFnaW5nL2hvc3Rpbmc.cache
  ```

### Seed a single product (emulator)

- Command: `export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 && SEED_OWNER_UID=<your_uid> node scripts/seed-product.js`
- What it does: writes one product with `userId=<your_uid>` so it passes the owner-only rules.
- Defaults: projectId falls back to `demo-emulator` unless `GCLOUD_PROJECT`/`PROJECT_ID` is set.
- If you must seed a real project, unset `FIRESTORE_EMULATOR_HOST` and provide credentials, but avoid running against prod unless intentional.

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
    --forward-to http://127.0.0.1:5001/black-river-market-b3dec/us-central1/stripeWebhook
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
