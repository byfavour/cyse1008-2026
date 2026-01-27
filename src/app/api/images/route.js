// src/app/api/images/route.js
import { NextResponse } from 'next/server';
import { getAdmin, getBucket } from 'src/lib/firebase/firebase-admin';
import { saveImageMeta, listImagesByOwner, getImageSignedUrl } from 'src/lib/firebase/images';

export const runtime = 'nodejs';

async function getAuthUid(request) {
  const admin = getAdmin();
  const auth = request.headers.get('authorization') || '';
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  const token = auth.slice(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch (e) {
    return null;
  }
}

export async function POST(request) {
  const uid = await getAuthUid(request);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await request.formData();
  const files = form.getAll('files');
  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files' }, { status: 400 });
  }

  const bucket = getBucket();
  const results = [];
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = file.type || 'application/octet-stream';
    const safeName = (file.name || `upload_${Date.now()}`).replace(/[^\w.\-]+/g, '_');
    const filePath = `images/library/${uid}/${Date.now()}_${safeName}`;

    const gcsFile = bucket.file(filePath);
    await gcsFile.save(buffer, {
      resumable: false,
      contentType,
      metadata: {
        metadata: { userId: uid, visibility: 'private' },
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });

    const id = await saveImageMeta({ userId: uid, filePath, contentType, visibility: 'private' });
    const url = await getImageSignedUrl(filePath, 3600);
    results.push({ id, filePath, url });
  }
  return NextResponse.json({ images: results }, { status: 201 });
}

export async function GET(request) {
  const uid = await getAuthUid(request);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const images = await listImagesByOwner(uid);
  const withUrls = await Promise.all(
    images.map(async (img) => ({ ...img, url: await getImageSignedUrl(img.filePath, 3600) }))
  );
  return NextResponse.json({ images: withUrls });
}
