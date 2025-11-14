'use server';

import { _orders } from 'src/_mock/_order';
import { CONFIG } from 'src/config-global';

import { OrderDetailsView } from 'src/sections/order/view';

export default async function Page({ params }) {
  const { id } = params;

  // Ensure this runs on the server and fetches the correct order
  const currentOrder = _orders.find((order) => order.id === id);

  return <OrderDetailsView order={currentOrder} />;
}

// ----------------------------------------------------------------------

/**
 * Static Exports Handling
 * Next.js 15 no longer supports `dynamic`, so we use `generateStaticParams()`
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    return _orders.map((order) => ({ id: order.id }));
  }
  return [];
}
