"use client";

import React, { createContext, useState } from 'react';
import { addProduct } from 'src/lib/firebase/products';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const createProduct = async (productData) => {
    try {
      const newProductId = await addProduct(productData);
      setProducts((prevProducts) => [...prevProducts, { id: newProductId, ...productData }]);
    } catch (error) {
      console.error("Error adding new product: ", error);
    }
  };

  return (
    <ProductContext.Provider value={{ products, createProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export default ProductContext;
