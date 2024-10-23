import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from './firebase';

export async function uploadImage(entityType, entityId, image) {
  try {
    const filePath = `${entityType}/${entityId}/${image.name}`;
    const newImageRef = ref(storage, filePath);
    await uploadBytesResumable(newImageRef, image);
    return await getDownloadURL(newImageRef);
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
}
