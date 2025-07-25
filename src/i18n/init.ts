import { addFn } from './helpers';
import type {
  ByObjectKey,
  LanguageMessages,
  ObjectDotKeys,
  ParamOptions,
  Params,
  PathsWithNoParams,
  PathsWithParams,
  Translations,
} from './types';

export type ReturnTranslate1<T> = {
  (locale?: Extract<keyof T, string>): string;
  to: (locale?: Extract<keyof T, string>) => string;
};

export type Translate_F<
  T extends Record<Lowercase<string>, Translations>,
> = {
  <S extends PathsWithNoParams>(key: S): ReturnTranslate1<T>;
  <S extends PathsWithParams, A extends Params<S>>(
    key: S,
    args: A,
  ): ReturnTranslate1<T>;
  <S extends ObjectDotKeys>(
    key: S,
  ): {
    (locale?: Extract<keyof T, string>): ByObjectKey<S>;
    to: (locale?: Extract<keyof T, string>) => ByObjectKey<S>;
  };
};

export type Paths<K extends keyof Translations = keyof Translations> =
  K extends PathsWithParams
    ? { key: PathsWithParams; args: Params<K> }
    : { key: PathsWithNoParams } | PathsWithNoParams;

export type TranslateWithLocale_F<
  T extends Record<Lowercase<string>, LanguageMessages>,
> = (locale: Extract<keyof T, string>, args: Paths) => string;

export const initI18n = <
  const T extends Record<Lowercase<string>, LanguageMessages>,
  K extends Extract<keyof T, string> = Extract<keyof T, string>,
>(
  translations: T,
  ...fallbacks: K[]
) => {
  const translateWithLocale: TranslateWithLocale_F<T> = (
    locale,
    values,
  ) => {
    const orderedLocales = new Set([
      ...getOrderedLocaleAndParentLocales(locale),
      ...fallbacks.flatMap(getOrderedLocaleAndParentLocales),
    ]);

    let out1 = '';

    for (const locale of orderedLocales) {
      const translationFile = translations[locale as keyof T];
      if (translationFile == null) continue;
      const _values: any =
        typeof values === 'string' ? { key: values, args: {} } : values;

      const translation = getTranslation(
        locale,
        translationFile as any,
        _values.key,
        _values.args,
      );
      if (translation) {
        out1 = translation;
        break;
      }
    }

    return out1;
  };

  //@ts-expect-error for build
  const translate: Translate_F<T> = (key, args) => {
    const to = (locale: K) => {
      return translateWithLocale(locale, {
        key,
        args,
      } as Paths);
    };

    const out = addFn(to, { to });

    return out;
  };

  return {
    translate,
    translateWithLocale,
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

function getTranslation(
  locale: string,
  translations: Translations,
  key: string,
  args?: any,
) {
  const translation = getTranslationByKey(translations, key);
  const argObj = args || {};

  if (typeof translation === 'string') {
    return performSubstitution(locale, translation, argObj, {});
  }

  if (Array.isArray(translation)) {
    const canReturn =
      translation.length !== 2 || typeof translation[1] === 'string';

    if (canReturn) return translation;
    const [str, options] = translation;

    return performSubstitution(locale, str, argObj, options);
  }

  const isObject = typeof translation === 'object' && translation !== null;
  if (isObject) {
    const obj: any = {};
    const entries = Object.entries(translation)
      .filter(([, v]) => {
        const notValid =
          Array.isArray(v) && v.length === 2 && typeof v[1] === 'object';
        return !notValid;
      })
      .map(([k]) => {
        return [
          k,
          getTranslation(locale, translations, `${key}.${k}`, {}),
        ] as const;
      });
    entries.forEach(([k, v]) => {
      obj[k] = v;
    });

    return obj;
  }

  return undefined;
}

function getTranslationByKey(obj: Translations, key: string) {
  const keys = key.split('.');
  let currentObj: any = obj;
  const len = keys.length - 1;

  let out = undefined;

  for (let i = 0; i <= len; i++) {
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
    if (i === len) {
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

        const replacement = pluralMap![pluralRules.select(argValue)]!;

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
