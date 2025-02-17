// products.js
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, deleteDoc } from "firebase/firestore";
import { db } from './firebase';

const productsCollectionRef = collection(db, "products");

// Add Product
export async function addProduct(productData) {
  try {
    const docRef = await addDoc(productsCollectionRef, productData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding product: ", error);
    throw error;
  }
}

// Update Product
export async function updateProduct(productId, updatedData) {
  try {
    const productDocRef = doc(db, "products", productId);
    await updateDoc(productDocRef, updatedData);
  } catch (error) {
    console.error("Error updating product: ", error);
    throw error;
  }
}

// Get All Products
export async function getProducts() {
  try {
    const querySnapshot = await getDocs(productsCollectionRef);
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    return products;
  } catch (error) {
    console.error("Error fetching products: ", error);
    throw error;
  }
}

// Get Product by ID
export async function getProductById(productId) {
  try {
    const productDocRef = doc(db, "products", productId);
    const productSnapshot = await getDoc(productDocRef);

    if (productSnapshot.exists()) {
      return { product: { id: productSnapshot.id, reviews: [] , ...productSnapshot.data() }};
    } else {
      throw new Error("Product does not exist");
    }
  } catch (error) {
    console.error("Error fetching product by ID: ", error);
    throw error;
  }
}

// Delete Product
export async function deleteProduct(productId) {
  try {
    const productDocRef = doc(db, "products", productId);
    await deleteDoc(productDocRef);
  } catch (error) {
    console.error("Error deleting product: ", error);
    throw error;
  }
}
