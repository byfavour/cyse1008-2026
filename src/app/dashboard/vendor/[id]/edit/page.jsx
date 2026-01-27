import { CONFIG } from 'src/config-global';

import { VendorEditView } from 'src/sections/vendor/view';

export const metadata = { title: `Edit vendor | Dashboard - ${CONFIG.appName}` };

export default async function Page({ params }) {
  const { id } = await params;
  return <VendorEditView vendorId={id} />;
}
