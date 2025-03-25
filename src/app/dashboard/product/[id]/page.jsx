'use client';

import { useParams } from 'next/navigation';
import ProductClientPage from './product-client-page';

export default function Page() {
  const { id } = useParams();
  return <ProductClientPage id={id} />;
}
