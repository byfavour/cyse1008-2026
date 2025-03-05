'use client';

import React, { useMemo, useState, createContext } from 'react';

import { addProduct, updateProduct } from 'src/lib/firebase/products';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, _] = useState(true);

  const createProduct = async (productData) => {
    try {
      const newProductId = await addProduct(productData);
      setProducts((prevProducts) => [...prevProducts, { id: newProductId, ...productData }]);
    } catch (error) {
      console.error('Error adding new product: ', error);
    }
  };

  const contextValue = useMemo(
    () => ({ products, createProduct, updateProduct, loading }),
    [products, loading] // Only re-create when these values change
  );

  return <ProductContext.Provider value={contextValue}>{children}</ProductContext.Provider>;
}

export default ProductContext;
