import type { ParamOptions } from './defineTranslation';
import { addFn } from './helpers';
import type {
  DotPathsFor,
  Params,
  PathsWithNoParams,
  PathsWithParams,
  SoA,
  Translations,
} from './types';

export const toArray = <T>(value: any): T[] =>
  Array.isArray(value) ? value : [value];

toArray.typed = <T>(value: T | T[]): T[] => toArray(value);

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
>(
  translations: T,
  fallbackLocale: SoA<keyof T>,
) => {
  const fallbackLocales = toArray<string>(fallbackLocale);

  //@ts-expect-error for build
  const translate: Translate_F<T> = (key, args) => {
    const _fn = (locale: Extract<keyof T, string>) => {
      const orderedLocales = new Set([
        ...getOrderedLocaleAndParentLocales(locale),
        ...fallbackLocales.flatMap(getOrderedLocaleAndParentLocales),
      ]);

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
        if (translation) return translation;
      }
      return key;
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
    const [str, translationParams] = translation;
    return performSubstitution(
      locale,
      str,
      argObj,
      translationParams as ParamOptions,
    );
  }

  return undefined;
}

function getTranslationByKey(obj: Translations, key: string) {
  const keys = key.split('.');
  let currentObj: any = obj;

  for (let i = 0; i <= keys.length - 1; i++) {
    const k = keys[i];
    const newObj = currentObj[k];
    if (newObj == null) return undefined;

    if (typeof newObj === 'string' || Array.isArray(newObj)) {
      if (i < keys.length - 1) return undefined;
      return newObj;
    }

    currentObj = newObj;
  }

  return undefined;
}

function performSubstitution(
  locale: string,
  str: string,
  args: Record<string, unknown>,
  translationParams: ParamOptions,
) {
  const entries = Object.entries(args);

  return entries.reduce((result, [argKey, argValue]) => {
    const match = result.match(`{${argKey}:?([^}]*)?}`);
    const [replaceKey, argType] = match
      ? match
      : [`{${argKey}}`, undefined];

    switch (argType) {
      case 'plural': {
        if (typeof argValue !== 'number')
          throw new Error('Invalid argument');
        const pluralMap = translationParams.plural?.[argKey];
        const pluralRules = new Intl.PluralRules(locale, {
          type: pluralMap?.type,
        });

        const replacement =
          pluralMap?.[pluralRules.select(argValue)] ?? pluralMap?.other;

        if (replacement == null)
          throw new Error('Missing replacement value');
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
        if (typeof argValue !== 'string')
          throw new Error('Invalid argument');
        const enumMap = translationParams.enum?.[argKey];
        const replacement = enumMap?.[argValue];

        if (replacement == null)
          throw new Error('Missing replacement value');
        return result.replace(replaceKey, replacement);
      }
      case 'number': {
        if (typeof argValue !== 'number')
          throw new Error('Invalid argument');
        const numberFormat = new Intl.NumberFormat(
          locale,
          translationParams.number?.[argKey],
        );

        return result.replace(replaceKey, numberFormat.format(argValue));
      }
      case 'list': {
        if (!Array.isArray(argValue)) throw new Error('Invalid argument');

        const formatter = new Intl.ListFormat(
          locale,
          translationParams.list?.[argKey],
        );
        return result.replace(replaceKey, formatter.format(argValue));
      }
      case 'date': {
        if (!(argValue instanceof Date))
          throw new Error('Invalid argument');

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
