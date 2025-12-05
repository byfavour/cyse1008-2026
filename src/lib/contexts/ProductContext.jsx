'use client';

import { createContext, useContext, useMemo, useCallback } from 'react';
import { collection, doc, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from 'src/lib/firebase/firebase';
import { useAuthContext } from 'src/auth/hooks';
const ProductContext = createContext(null);

function sanitizeNumber(n, fallback = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

function normalizeVariant(v) {
  const stock = sanitizeNumber(v?.stock ?? v?.quantity ?? 0);
  const price = sanitizeNumber(v?.price ?? 0);
  const sku = (v?.sku ?? '').toString().trim();
  const title = (v?.title ?? '').toString().trim();
  const options = typeof v?.options === 'object' && v?.options !== null ? v.options : {};
  const image = typeof v?.image === 'string' ? v.image : undefined; // single URL

  return { title, sku, price, stock, options, ...(image ? { image } : {}) };
}

function normalizeForWrite(input, { userId }) {
  const base = {
    title: (input?.name ?? input?.title ?? '').toString().trim(),
    name: (input?.name ?? input?.title ?? '').toString().trim(),
    code: (input?.code ?? '').toString().trim(),
    sku: (input?.sku ?? '').toString().trim(),
    description: input?.description ?? '',
    subDescription: input?.subDescription ?? '',
    images: Array.isArray(input?.images) ? input.images : [],
    price: sanitizeNumber(input?.price ?? 0),
    priceSale: sanitizeNumber(input?.priceSale ?? 0),
    taxes: sanitizeNumber(input?.taxes ?? 0),
    gender: Array.isArray(input?.gender) ? input.gender : [],
    category: input?.category ?? '',
    colors: Array.isArray(input?.colors) ? input.colors : [],
    sizes: Array.isArray(input?.sizes) ? input.sizes : [],
    tags: Array.isArray(input?.tags) ? input.tags : [],
    options: Array.isArray(input?.options) ? input.options : [], // [{name,values}]
    newLabel: input?.newLabel ?? { enabled: false, content: '' },
    saleLabel: input?.saleLabel ?? { enabled: false, content: '' },
    userId: userId,
    source: input?.source ?? 'manual',
    integrations: input?.integrations ?? {},
    vendorId: (input?.vendorId ?? '').toString(),
    vendorName: (input?.vendorName ?? '').toString(),
  };

  const hasVariants = Array.isArray(input?.variants) && input.variants.length > 0;
  const variants = hasVariants
    ? input.variants.map(normalizeVariant)
    : [
        normalizeVariant({
          title: base.title,
          sku: base.sku || base.code || 'SKU-DEFAULT',
          price: base.price,
          stock: input?.stock ?? 0,
          options: {},
          image: base.images?.[0],
        }),
      ];

  const stock = variants.reduce((s, v) => s + sanitizeNumber(v.stock, 0), 0);

  // drop legacy keys
  const cleanedVariants = variants.map(({ quantity, ...rest }) => rest);

  return {
    ...base,
    variants: cleanedVariants,
    stock,
    updatedAt: serverTimestamp(),
  };
}

export function ProductProvider({ children }) {
  const { user } = useAuthContext();

  const createProduct = useCallback(
    async (raw) => {
      const body = normalizeForWrite(raw, { userId: user?.id || user?.uid });
      const col = collection(db, 'products');
      const docRef = await addDoc(col, { ...body, createdAt: serverTimestamp() });
      return docRef.id;
    },
    [user]
  );

  const updateProduct = useCallback(
    async (id, raw) => {
      const body = normalizeForWrite(raw, { userId: user?.id || user?.uid });
      const ref = doc(db, 'products', id);
      await setDoc(ref, body, { merge: true });
      return id;
    },
    [user]
  );

  const value = useMemo(() => ({ createProduct, updateProduct }), [createProduct, updateProduct]);

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export default ProductContext;
