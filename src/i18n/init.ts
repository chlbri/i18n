import { addFn } from './helpers';
import type {
  DotPathsFor,
  ParamOptions,
  Params,
  PathsWithNoParams,
  PathsWithParams,
  Translations,
} from './types';

export type ReturnTranslate<T> = {
  (locale?: Extract<keyof T, string>): string;
  to: (locale?: Extract<keyof T, string>) => string;
};

export type Translate_F<
  T extends Record<Lowercase<string>, Translations>,
> = {
  <S extends PathsWithNoParams>(key: S): ReturnTranslate<T>;
  <S extends PathsWithParams, A extends Params<S>>(
    key: S,
    args: A,
  ): ReturnTranslate<T>;
};

export const initI18n = <
  const T extends Record<Lowercase<string>, Translations>,
  K extends Extract<keyof T, string> = Extract<keyof T, string>,
>(
  translations: T,
  ...fallbacks: K[]
) => {
  //@ts-expect-error for build
  const translate: Translate_F<T> = (key, args) => {
    const _fn = (locale: K) => {
      const orderedLocales = new Set([
        ...getOrderedLocaleAndParentLocales(locale),
        ...fallbacks.flatMap(getOrderedLocaleAndParentLocales),
      ]);

      let out1 = '';

      for (const locale of orderedLocales) {
        const translationFile = translations[
          locale as keyof T
        ] as Translations;
        if (translationFile == null) continue;
        const translation = getTranslation(
          locale,
          translationFile,
          key,
          args,
        );
        if (translation) {
          out1 = translation;
          break;
        }
      }

      return out1;
    };

    const out = addFn(_fn, {
      to: _fn,
    });

    return out;
  };

  return {
    translate,
  };
};

function getOrderedLocaleAndParentLocales(locale?: string) {
  const locales: string[] = [];
  if (typeof locale !== 'string') return locales;
  let parentLocale = locale;
  while (parentLocale !== '') {
    locales.push(parentLocale);
    parentLocale = parentLocale.replace(/-?[^-]+$/, '');
  }
  return locales;
}

function getTranslation<S extends DotPathsFor, A extends Params<S>>(
  locale: string,
  translations: Translations,
  key: S,
  args?: A,
) {
  const translation = getTranslationByKey(translations, key);
  const argObj = args || {};

  if (typeof translation === 'string') {
    return performSubstitution(locale, translation, argObj, {});
  }

  if (Array.isArray(translation)) {
    const [str, options] = translation;

    return performSubstitution(locale, str, argObj, options);
  }

  return undefined;
}

function getTranslationByKey(obj: Translations, key: string) {
  const keys = key.split('.');
  let currentObj: any = obj;

  let out = undefined;

  for (let i = 0; i <= keys.length - 1; i++) {
    const k = keys[i];
    const newObj = currentObj[k];
    if (!newObj) return undefined;

    const canReturn =
      typeof newObj === 'string' ||
      (Array.isArray(newObj) &&
        newObj.length === 2 &&
        typeof newObj[0] === 'string');

    if (canReturn) {
      out = newObj;
      break;
    }

    currentObj = newObj;
  }

  return out;
}

function performSubstitution(
  locale: string,
  str: string,
  args: Record<string, any>,
  translationParams: ParamOptions,
) {
  const entries = Object.entries(args);

  return entries.reduce((result, [argKey, argValue]) => {
    const match = result.match(`{${argKey}:?([^}]*)?}`);
    const [replaceKey, argType] = match!;

    switch (argType) {
      case 'plural': {
        const pluralMap = translationParams.plural?.[argKey];
        const pluralRules = new Intl.PluralRules(locale, {
          type: pluralMap?.type,
        });

        const replacement =
          pluralMap?.[pluralRules.select(argValue)] ?? pluralMap!.other;

        const numberFormatter = new Intl.NumberFormat(
          locale,
          translationParams.plural?.[argKey]?.formatter,
        );
        return result.replace(
          replaceKey,
          replacement.replace(`{?}`, numberFormatter.format(argValue)),
        );
      }
      case 'enum': {
        const replacement = translationParams.enum![argKey][argValue];

        return result.replace(replaceKey, replacement);
      }
      case 'number': {
        const numberFormat = new Intl.NumberFormat(
          locale,
          translationParams.number?.[argKey],
        );

        return result.replace(replaceKey, numberFormat.format(argValue));
      }
      case 'list': {
        const formatter = new Intl.ListFormat(
          locale,
          translationParams.list?.[argKey],
        );
        return result.replace(replaceKey, formatter.format(argValue));
      }
      case 'date': {
        const dateFormat = new Intl.DateTimeFormat(
          locale,
          translationParams.date?.[argKey],
        );
        return result.replace(replaceKey, dateFormat.format(argValue));
      }
      default:
        return result.replace(replaceKey, String(argValue));
    }
  }, str);
}
