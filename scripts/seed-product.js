/* Seed a single product into Firestore (emulator by default).
 *
 * Usage (emulator):
 *   export FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
 *   SEED_OWNER_UID=<your_uid> node scripts/seed-product.js
 *
 * If you truly need to seed a real project, unset FIRESTORE_EMULATOR_HOST and
 * set FIREBASE_CONFIG or GOOGLE_APPLICATION_CREDENTIALS accordingly.
 */

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const ownerId = process.env.SEED_OWNER_UID || 'owner-uid-placeholder';

const usingEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;
const projectId =
  process.env.GCLOUD_PROJECT ||
  process.env.FIREBASE_CONFIG?.projectId ||
  process.env.PROJECT_ID ||
  'demo-emulator';

const app =
  usingEmulator
    ? initializeApp({ projectId })
    : initializeApp({
        credential: applicationDefault(),
        projectId,
      });

const db = getFirestore(app);

async function seed() {
  const productRef = db.collection('products').doc();
  const product = {
    name: 'Sample Product',
    price: 7,
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'One item for launch-day checkout testing.',
    userId: ownerId,
    stock: 100,
    variants: [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await productRef.set(product);
  // eslint-disable-next-line no-console
  console.log(`Seeded product ${product.name} with id: ${productRef.id}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
