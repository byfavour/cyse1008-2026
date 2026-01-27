'use client';

import { CacheProvider } from '@emotion/react';

import CssBaseline from '@mui/material/CssBaseline';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';

import { useTranslate } from 'src/locales';
import createEmotionCache from 'src/theme/create-emotion-cache';

import { useSettingsContext } from 'src/components/settings';

import { createTheme } from './create-theme';
import { schemeConfig } from './scheme-config';
import { RTL } from './with-settings/right-to-left';

// Create a cache instance for Emotion
const clientSideEmotionCache = createEmotionCache();

// ----------------------------------------------------------------------

export function ThemeProvider({ children }) {
  const { currentLang } = useTranslate();
  const settings = useSettingsContext();
  const theme = createTheme(currentLang?.systemValue, settings);

  return (
    <CacheProvider value={clientSideEmotionCache}>
      {' '}
      {/* ✅ Emotion's CacheProvider */}
      <CssVarsProvider
        theme={theme}
        defaultMode={schemeConfig.defaultMode}
        modeStorageKey={schemeConfig.modeStorageKey}
      >
        <CssBaseline />
        <RTL direction={settings.direction}>{children}</RTL>
      </CssVarsProvider>
    </CacheProvider>
  );
}
