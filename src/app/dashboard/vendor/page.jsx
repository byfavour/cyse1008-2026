import { CONFIG } from 'src/config-global';

import { VendorListView } from 'src/sections/vendor/view';

export const metadata = { title: `Vendors | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <VendorListView />;
}
