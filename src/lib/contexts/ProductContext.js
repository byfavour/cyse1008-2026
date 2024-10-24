import React, { createContext, useState, useEffect } from 'react';
import { getRestaurants, addProduct } from '@/src/lib/firebase/products';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getRestaurants();
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };
    fetchProducts();
  }, []);

  const addNewProduct = async (productData) => {
    try {
      const newProductId = await addProduct(productData);
      setProducts((prevProducts) => [...prevProducts, { id: newProductId, ...productData }]);
    } catch (error) {
      console.error("Error adding new product: ", error);
    }
  };

  return (
    <ProductContext.Provider value={{ products, addNewProduct, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export default ProductContext;
