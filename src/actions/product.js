import useSWR from 'swr';
import { useMemo, useState, useEffect } from 'react';

import { fetcher, endpoints } from 'src/utils/axios';

import { getProducts } from 'src/lib/firebase/products.js';
// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

// export function useGetProducts() {
//   const url = endpoints.product.list;

//   const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

//   const memoizedValue = useMemo(
//     () => ({
//       products: data?.products || [],
//       productsLoading: isLoading,
//       productsError: error,
//       productsValidating: isValidating,
//       productsEmpty: !isLoading && !data?.products.length,
//     }),
//     [data?.products, error, isLoading, isValidating]
//   );

//   return memoizedValue;
// }

export function useGetProducts() {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [productsValidating, setProductsValidating] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setProductsLoading(true);
      setProductsValidating(true);
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        setProductsError(null);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductsError(error);
      } finally {
        setProductsLoading(false);
        setProductsValidating(false);
      }
    }

    fetchProducts();
  }, []);

  const memoizedValue = useMemo(
    () => ({
      products,
      productsLoading,
      productsError,
      productsValidating,
      productsEmpty: !productsLoading && products.length === 0,
    }),
    [products, productsLoading, productsError, productsValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetProduct(productId) {
  const url = productId ? [endpoints.product.details, { params: { productId } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      product: data?.product,
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating]
  );

  return memoizedValue;
}
// src/actions/product.js

// ----------------------------------------------------------------------

export function useSearchProducts(query) {
  const url = query ? [endpoints.product.search, { params: { query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !data?.results.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}
