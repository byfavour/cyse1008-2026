// products.js
import {
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from './firebase';

const productsCollectionRef = collection(db, 'products');

export async function addProduct(productData) {
  try {
    const payload = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(productsCollectionRef, payload);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product: ', error);
    throw error;
  }
}

// Update Product
export async function updateProduct(productId, updatedData) {
  try {
    const payload = {
      ...updatedData,
      updatedAt: serverTimestamp(),
    };
    const productDocRef = doc(db, 'products', productId);
    await updateDoc(productDocRef, payload);
  } catch (error) {
    console.error('Error updating product: ', error);
    throw error;
  }
}

// Get All Products
export async function getProducts() {
  try {
    const querySnapshot = await getDocs(productsCollectionRef);
    const products = querySnapshot.docs.map((_doc) => {
      const data = _doc.data();
      const name = data?.name || data?.title || '';
      return {
        id: _doc.id,
        name,
        ...data,
      };
    });
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
      const data = productSnapshot.data();
      const name = data?.name || data?.title || '';
      return {
        product: { id: productId, name, reviews: [], ...data },
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

// Fetch shared product options (categories/colors/sizes) from Firestore.
// Expects docs at product_options/{type} with a `values` array (strings or objects).
export async function getProductOptions(type) {
  const ref = doc(db, 'product_options', type);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data().values || null;
}
