import { CONFIG } from 'src/config-global';

import { VendorDetailsView } from 'src/sections/vendor/view';

export const metadata = { title: `Vendor details | Dashboard - ${CONFIG.appName}` };

export default function Page({ params }) {
  return <VendorDetailsView id={params.id} />;
}
