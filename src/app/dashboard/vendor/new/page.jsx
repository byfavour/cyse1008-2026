import { CONFIG } from 'src/config-global';

import { VendorCreateView } from 'src/sections/vendor/view';

export const metadata = { title: `New vendor | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <VendorCreateView />;
}
