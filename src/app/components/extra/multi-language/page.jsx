'use server';

import { CONFIG } from 'src/config-global';
import { getServerTranslations } from 'src/locales/server';

import { MultiLanguageView } from 'src/sections/_examples/extra/multi-language-view';
import { navData } from 'src/sections/_examples/extra/multi-language-view/config-nav';

export default async function Page() {
  let ssrNavData = null;

  try {
    const isStaticExport = CONFIG?.isStaticExport ?? true;

    if (!isStaticExport) {
      const { t } = await getServerTranslations('navbar');
      ssrNavData = navData(t);
    }
  } catch (error) {
    console.error('Error in Page component:', error);
  }

  return <MultiLanguageView ssrNavData={ssrNavData} />;
}
