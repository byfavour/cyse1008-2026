'use server';

import { CONFIG } from 'src/config-global';
import { _invoices } from 'src/_mock/_invoice';

import { InvoiceEditView } from 'src/sections/invoice/view';

export default async function Page({ params }) {
  const { id } = params;

  // Ensure this runs on the server and fetches the correct invoice
  const currentInvoice = _invoices.find((invoice) => invoice.id === id);

  return <InvoiceEditView invoice={currentInvoice} />;
}

// ----------------------------------------------------------------------

/**
 * Static Exports Handling
 * Next.js 15 no longer supports `dynamic`, so we use `generateStaticParams()`
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    return _invoices.map((invoice) => ({ id: invoice.id }));
  }
  return [];
}
