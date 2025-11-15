import { CONFIG } from 'src/config-global';

import { VendorEditView } from 'src/sections/vendor/view';

export const metadata = { title: `Edit vendor | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  return <VendorEditView vendorId={params.id} />;
}
