'use server';

import axios, { endpoints } from 'src/utils/axios';

import { CONFIG } from 'src/config-global';
import { getProductById } from 'src/lib/firebase/products';

import { ProductDetailsView } from 'src/sections/product/view';

export default async function Page({ params }) {
  const { id } = params;
  const { product = {} } = await getProductById(id);
  return <ProductDetailsView product={product} />;
}

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    const res = await axios.get(endpoints.product.list);

    return res.data.products.map((product) => ({ id: product.id }));
  }
  return [];
}
