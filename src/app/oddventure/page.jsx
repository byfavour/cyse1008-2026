import { CONFIG } from 'src/config-global';

import { OddventureView } from 'src/sections/oddventure/view';

// ----------------------------------------------------------------------

export const metadata = { title: `Oddventure - ${CONFIG.appName}` };

export default function Page() {
  return <OddventureView />;
}
