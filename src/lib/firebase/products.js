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

import { db, AUTH } from './firebase';

// ---------------------------------------------------------------------------
// Firestore Rules Inspector
// Reconstructs the `request` and `resource` objects that security rules see,
// using the live auth token. Call logRuleContext() anywhere before a read/write
// to show students exactly what the rules evaluate.
// ---------------------------------------------------------------------------
async function buildRequest({ method, writePath = null, writeData = null }) {
  const user = AUTH.currentUser;
  let authContext = null;

  if (user) {
    const tokenResult = await user.getIdTokenResult();
    authContext = {
      uid: user.uid,
      token: {
        email: tokenResult.claims.email,
        email_verified: tokenResult.claims.email_verified,
        // custom claims (role, etc.) appear here
        ...Object.fromEntries(
          Object.entries(tokenResult.claims).filter(
            ([k]) => !['iss', 'aud', 'auth_time', 'sub', 'iat', 'exp', 'firebase'].includes(k)
          )
        ),
      },
    };
  }

  const request = {
    auth: authContext, // null when signed out
    method,           // 'get' | 'list' | 'create' | 'update' | 'delete'
    time: new Date().toISOString(), // approximation of request.time
    ...(writePath && { path: writePath }),
    ...(writeData && { resource: { data: writeData } }), // request.resource on writes
  };

  return request;
}

function logRuleContext(label, { request, resource = null }) {
  console.groupCollapsed(`🔐 Firestore Rules Context — ${label}`);
  console.log('request (what the rule sees on every operation):', request);
  if (resource) {
    console.log('resource (the existing document):', resource);
  } else {
    console.log('resource: null (no existing doc — this is a list or create)');
  }
  console.groupEnd();
}

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
    console.error('Firestore add product error (collection: products):', error);
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
    console.error('Firestore update product error (collection: products):', error);
    throw error;
  }
}

// Get All Products
export async function getProducts() {
  try {
    const request = await buildRequest({ method: 'list' });
    logRuleContext('getProducts (list /products)', { request });

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
    console.error('Firestore get products error (collection: products):', error);
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

      const request = await buildRequest({ method: 'get' });
      const resource = { __name__: `products/${productId}`, data };
      logRuleContext(`getProductById (get /products/${productId})`, { request, resource });

      const name = data?.name || data?.title || '';
      return {
        product: { id: productId, name, reviews: [], ...data },
      };
    }

    throw new Error(`Product does not exist ${productId}`);
  } catch (error) {
    console.error('Firestore get product by ID error (collection: products):', error);
    throw error;
  }
}

// Delete Product
export async function deleteProduct(productId) {
  try {
    const productDocRef = doc(db, 'products', productId);
    await deleteDoc(productDocRef);
  } catch (error) {
    console.error('Firestore delete product error (collection: products):', error);
    throw error;
  }
}

// Fetch shared product options (categories/colors/sizes) from Firestore.
// Expects docs at product_options/{type} with a `values` array (strings or objects).
export async function getProductOptions(type) {
  const ref = doc(db, 'product_options', type);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data().values || null;
  } catch (error) {
    console.error('Firestore get product options error (collection: product_options):', error);
    throw error;
  }
}
