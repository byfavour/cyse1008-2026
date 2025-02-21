import { CONFIG } from 'src/config-global';

import { OverviewEncryptionView } from 'src/sections/overview/encryption/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Encryption | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <OverviewEncryptionView />;
}
