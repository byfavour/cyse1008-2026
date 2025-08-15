import { uploadImageToLibrary } from 'src/lib/firebase/storage';
import { saveImageMeta, listImageMeta } from 'src/lib/firebase/images';

export async function POST(request) {
  const form = await request.formData();
  const files = form.getAll('files');
  const results = [];

  for (const file of files) {
    const arr = await file.arrayBuffer();
    // 1) do the actual upload+per‑user Firestore write:
    const downloadURL = await uploadImageToLibrary(userId, file);
    // uploadImageToLibrary already writes under users/{userId}/images,
    // but if you also want a global index, save here:
    const docId = await saveImageMeta({
      imageUrl: downloadURL,
      filePath: `images/library/${userId}/${file.name}`,
      uploadedBy: userId,
      associatedEntityId: null,
    });
    results.push({ id: docId, url: downloadURL });
  }

  return NextResponse.json({ images: results }, { status: 201 });
}

export async function GET() {
  const images = await listImageMeta();
  return NextResponse.json({ images });
}
