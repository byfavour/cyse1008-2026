// products.js
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from './firebase';

const productsCollectionRef = collection(db, "products");

export async function addProduct(productData) {
  try {
    const docRef = await addDoc(productsCollectionRef, productData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding product: ", error);
    throw error;
  }
}

export async function updateProduct(productId, updatedData) {
  try {
    const docRef = doc(productsCollectionRef, productId);
    await updateDoc(docRef, updatedData);
  } catch (error) {
    console.error("Error updating product: ", error);
    throw error;
  }
}

// ... add more functions as required (getProductById, deleteProduct, etc.)
