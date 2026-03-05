'use client';

import { useParams } from 'next/navigation';
import ProductEditPage from './product-edit-client';

export default function Page() {
  const { id } = useParams();
  return <ProductEditPage id={id} />;
}
