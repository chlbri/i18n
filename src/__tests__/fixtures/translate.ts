import { initI18n } from '#i18n';
import en from './langs/en';
import enUS from './langs/en-US';
import esES from './langs/es-ES';

export const { translate } = initI18n(
  {
    en,
    'en-us': enUS,
    'es-es': esES,
  },
  'en',
);
