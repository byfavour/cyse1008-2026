import { cookies } from 'next/headers';

import { STORAGE_KEY, defaultSettings } from './config-settings';

// ----------------------------------------------------------------------

export async function detectSettings() {
  const cookieStore = await cookies();

  const settingsStore = await cookieStore.get(STORAGE_KEY);

  return settingsStore ? JSON.parse(settingsStore?.value) : defaultSettings;
}
