'use client';

import { useEffect, useState } from 'react';
import { getProductById } from 'src/lib/firebase/products';

export default function WithProduct({ id, children }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const { product } = await getProductById(id);
      setProduct(product);
    };
    fetch();
  }, [id]);

  if (!product) return <div>Loading product...</div>;

  return typeof children === 'function' ? children(product) : null;
}
