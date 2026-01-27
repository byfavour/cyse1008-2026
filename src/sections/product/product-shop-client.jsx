'use client';

import { useEffect, useState } from 'react';
import { getProducts } from 'src/lib/firebase/products';
import { ProductShopView } from 'src/sections/product/view';

export default function ProductShopClient() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((products) => setProducts(products))
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading products...</p>;
  return <ProductShopView products={products} />;
}
