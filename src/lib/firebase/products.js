// products.js
import {
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  // connectFirestoreEmulator,
} from 'firebase/firestore';

import { db } from './firebase';

// connectFirestoreEmulator(db, '127.0.0.1', 8080); // Ensure it's using emulator

const productsCollectionRef = collection(db, 'products');

// Add Product
export async function addProduct(productData) {
  try {
    const docRef = await addDoc(productsCollectionRef, productData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product: ', error);
    throw error;
  }
}

// Update Product
export async function updateProduct(productId, updatedData) {
  try {
    const productDocRef = doc(db, 'products', productId);
    await updateDoc(productDocRef, updatedData);
  } catch (error) {
    console.error('Error updating product: ', error);
    throw error;
  }
}

// Get All Products
export async function getProducts() {
  try {
    const querySnapshot = await getDocs(productsCollectionRef);
    const products = querySnapshot.docs.map((_doc) => ({
      id: _doc.id,
      ..._doc.data(),
    }));
    console.log({ products });
    return products;
  } catch (error) {
    console.error('Error fetching products: ', error);
    throw error;
  }
}

// Get Product by ID
export async function getProductById(productId) {
  try {
    const productDocRef = doc(db, 'products', productId);

    const productSnapshot = await getDoc(productDocRef);
    if (productSnapshot.exists()) {
      return {
        product: { id: productId, reviews: [], ...productSnapshot.data() },
      };
    }

    throw new Error(`Product does not exist ${productId}`);
  } catch (error) {
    console.error('Error fetching product by ID: ', error);
    throw error;
  }
}

// Delete Product
export async function deleteProduct(productId) {
  try {
    const productDocRef = doc(db, 'products', productId);
    await deleteDoc(productDocRef);
  } catch (error) {
    console.error('Error deleting product: ', error);
    throw error;
  }
}
