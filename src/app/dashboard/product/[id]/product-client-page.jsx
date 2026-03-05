'use client';

import { useEffect, useState } from 'react';
import { getProductById } from 'src/lib/firebase/products';
import { ProductDetailsView } from 'src/sections/product/view';

export default function ProductClientPage({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { product } = await getProductById(id);
        setProduct(product ?? null);
      } catch (err) {
        console.error('🔥 Failed to fetch product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found!</div>;

  return <ProductDetailsView product={product} />;
}
