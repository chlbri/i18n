import { initI18n, type Translate_F } from '#i18n';
import en from './langs/en';
import enUS from './langs/en-US';
import esES from './langs/es-ES';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TRANSLATIONS = {
  en,
  'en-us': enUS,
  'es-es': esES,
} as const;

export const { translate } = initI18n(
  {
    en,
    'es-es': esES,
    'en-us': enUS,
  },
  'en',
) as { translate: Translate_F<typeof TRANSLATIONS> };
