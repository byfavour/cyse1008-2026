'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import the FirestoreRouteClient only on client side
const ProductClientPage = dynamic(() => import('./product-client-page'), { ssr: false });

export default function ProductClientWrapper({ params }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // delay render until client
  }, []);

  if (!mounted) return <div>Loading...</div>;

  return <ProductClientPage params={params} />;
}
