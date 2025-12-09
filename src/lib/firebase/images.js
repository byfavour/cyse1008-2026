import { getDb, getBucket } from 'src/lib/firebase/firebase-admin';

export async function saveImageMeta({
  userId,
  filePath,
  contentType,
  visibility = 'private',
  extra = {},
}) {
  const db = getDb();
  const docRef = await db.collection('images').add({
    userId,
    filePath,
    contentType,
    visibility,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    ...extra,
  });
  return docRef.id;
}

export async function listImagesByOwner(userId) {
  const db = getDb();
  const snap = await db
    .collection('images')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getImageSignedUrl(filePath, expiresInSeconds = 3600) {
  const bucket = getBucket();
  const [url] = await bucket.file(filePath).getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInSeconds * 1000,
  });
  return url;
}
