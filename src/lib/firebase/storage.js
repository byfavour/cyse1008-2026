import { v4 as uuidv4 } from 'uuid';
import { doc, setDoc } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

import { db, storage } from 'src/lib/firebase/firebase';

export async function uploadImageToLibrary(userId, image) {
  try {
    if (!userId) throw new Error('No user ID provided.');
    if (!image || !image.name) throw new Error('A valid image must be provided.');

    const imageId = uuidv4();
    const filePath = `images/library/${userId}/${imageId}-${image.name}`;
    const imageRef = ref(storage, filePath);

    await uploadBytesResumable(imageRef, image);
    const downloadURL = await getDownloadURL(imageRef);

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
    console.error('Error uploading image to library:', error);
    throw error;
  }
}

export async function uploadImagesToLibrary(userId, images) {
  const uploadedImageUrls = await Promise.all(
    images.map(async (image) => {
      try {
        return await uploadImageToLibrary(userId, image);
      } catch (error) {
        console.error('Error uploading one of the images:', error);
        throw error;
      }
    })
  );
  return uploadedImageUrls;
}
