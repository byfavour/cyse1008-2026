import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { db, storage } from 'src/lib/firebase/firebase';

export async function uploadImageToLibrary(userId, image) {
  try {
    console.log('📸 Received image:', image);

    const auth = getAuth();
    const currentUser = auth.currentUser;
    console.log({ currentUser });
    auth.currentUser
      ?.getIdToken(true)
      .then((token) => {
        console.log('Current Auth Token:', token);
      })
      .catch((error) => {
        console.error('Auth Token Error:', error);
      });

    const token = await auth.currentUser.getIdToken(true);
    console.log('✅ Current Auth Token:', token);

    console.log('🔎 Checking user ID match...');
    if (auth.currentUser.uid !== userId) {
      throw new Error(`❌ User ID mismatch! Expected ${auth.currentUser.uid}, got ${userId}`);
    }
    if (!userId) throw new Error('No user ID provided.');
    if (!image || !image.name) throw new Error('A valid image must be provided.');

    const imageId = uuidv4();
    console.log('USER ID:', userId);
    console.log('File Name:', image.name);
    console.log('File Type:', image.type);

    const filePath = `images/library/${userId}/${imageId}-${image.name}`;
    const imageRef = ref(storage, filePath);

    // ✅ Explicitly setting metadata
    const metadata = {
      contentType: image.type || 'image/jpeg',
    };

    await uploadBytesResumable(imageRef, image, metadata);
    const downloadURL = await getDownloadURL(imageRef);
    console.log('✅ Image uploaded successfully:', downloadURL);

    // Store metadata in Firestore
    const imageDocRef = doc(db, `users/${userId}/images/${imageId}`);
    await setDoc(imageDocRef, {
      imageUrl: downloadURL,
      filePath,
      uploadedBy: userId,
      createdAt: new Date(),
      associatedEntityId: null,
    });

    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    throw error;
  }
}

export async function uploadImagesToLibrary(uid, files) {
  if (!uid) throw new Error('Missing uid for upload');
  const uploads = files.map(async (file) => {
    const key = `users/${uid}/library/${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}_${file.name}`;
    const fileRef = ref(storage, key);
    await uploadBytesResumable(fileRef, file, { contentType: file.type });
    return await getDownloadURL(fileRef);
  });
  return Promise.all(uploads);
}
