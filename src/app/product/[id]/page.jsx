'use server';

import dynamic from 'next/dynamic';

// Dynamically import the client component
const ProductClientPage = dynamic(() => import('./product-client-page'), { ssr: false });

export default function Page({ params }) {
  // It's okay that this function is async if `generateStaticParams` exists
  return <ProductClientPage id={params.id} />;
}
