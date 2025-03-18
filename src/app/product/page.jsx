import { getProducts } from 'src/lib/firebase/products';

import { ProductShopView } from 'src/sections/product/view';

export default async function Page() {
  const { products = [] } = await getProducts();

  return <ProductShopView products={products} />;
}
