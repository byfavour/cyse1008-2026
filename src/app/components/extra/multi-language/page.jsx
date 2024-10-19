
import { CONFIG } from 'src/config-global';
import { getServerTranslations } from 'src/locales/server';

import { MultiLanguageView } from 'src/sections/_examples/extra/multi-language-view';
import { navData } from 'src/sections/_examples/extra/multi-language-view/config-nav';

// ----------------------------------------------------------------------
export const dynamic = 'force-dynamic';
export const metadata = { title: `Multi language | Components - ${CONFIG.appName}` };


export default async function Page() {
  let ssrNavData;

  try {
    if (!CONFIG.isStaticExport) {
      const { t } = await getServerTranslations('navbar');
      const data = navData(t);

      ssrNavData = data;
    }
  } catch (error) {
    console.error('Error in Page component:', error);
    // Optionally, you can re-throw the error if you want the build to fail intentionally
    // throw error;
  }

  return <MultiLanguageView ssrNavData={ssrNavData} />;
}
