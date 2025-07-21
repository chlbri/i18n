import type { Register } from '../index';
import type { defineTranslation, ParamOptions } from './defineTranslation';

type StateValeMap = {
  [key: string]: StateValue;
};

export type StateValue = string | StateValeMap;

export type SoA<T> = T | T[];

export type RegisteredTranslations = Register extends {
  translations: infer T;
}
  ? T extends infer Translations
    ? Translations
    : never
  : LanguageMessages;

type _Translations<R> = R extends [any, infer N] | string
  ? N extends { plural: any }
    ? [
        StateValue,
        N & {
          plural: {
            [K in keyof N['plural']]: Partial<
              Record<Exclude<Intl.LDMLPluralRule, 'other'>, string>
            > & {
              other: `{?} ${string}`; // {?} is a special placeholder for plural rules
              formatter?: Intl.NumberFormatOptions;
              type?: Intl.PluralRuleType;
            };
          };
        },
      ]
    : SoA<StateValue>
  : R extends object
    ? {
        [K in keyof R]?: _Translations<R[K]>;
      }
    : never;

export type Translations = _Translations<RegisteredTranslations>;

type I18nMessage = string | ReturnType<typeof defineTranslation>;

export type LanguageMessages = {
  [key: string]: I18nMessage | LanguageMessages;
};

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

type DotPathsFor<T extends object = RegisteredTranslations> = {
  [K in keyof T]: T[K] extends I18nMessage
    ? K
    : T[K] extends object
      ? Join<K, DotPathsFor<T[K]>>
      : never;
}[keyof T];

type EnumMap = Record<string, Record<string, string>>;

type ParseArgType<
  ParamType extends string,
  ParamName extends string,
  Enums extends EnumMap,
> = ParamType extends 'number' | 'plural'
  ? number
  : ParamType extends 'date'
    ? Date
    : ParamType extends 'list'
      ? string[]
      : ParamType extends 'enum'
        ? ParamName extends keyof Enums
          ? keyof Enums[ParamName]
          : never
        : never;

type ExtractParamArgs<
  S extends string,
  Enums extends EnumMap,
> = S extends `${string}{${infer Param}}${infer Rest}`
  ? Param extends `${infer Name}:${infer Type}` // If the string contains a parameter
    ? { [K in Name]: ParseArgType<Type, Name, Enums> } & ExtractParamArgs<
        Rest,
        Enums
      > // If the string contains a parameter with a type
    : { [K in Param]: string } & ExtractParamArgs<Rest, Enums> // If the string has no parameter type
  : unknown; // If the string has no parameters

type TranslationAtKeyWithParams<
  Translations,
  Key extends string,
> = Key extends `${infer First}.${infer Rest}`
  ? First extends keyof Translations
    ? TranslationAtKeyWithParams<Translations[First], Rest>
    : never
  : Key extends keyof Translations
    ? Translations[Key]
    : never;

type NormalizedTranslationAtKey<T> =
  T extends ReturnType<typeof defineTranslation>
    ? T
    : [T, ReturnType<typeof defineTranslation>[1]];

type NormalizedTranslationAtKeyWithParams<Key extends string> =
  NormalizedTranslationAtKey<
    TranslationAtKeyWithParams<RegisteredTranslations, Key>
  >;

type Params<S extends DotPathsFor> = ExtractParamArgs<
  Extract<NormalizedTranslationAtKeyWithParams<S>[0], string>,
  NormalizedTranslationAtKeyWithParams<S>[1] extends {
    enum: infer E;
  }
    ? keyof E extends never
      ? EnumMap
      : E
    : EnumMap
>;

type PathsWithParams = {
  [K in DotPathsFor]: keyof Params<K> extends never ? never : K;
}[DotPathsFor];

type PathsWithNoParams = {
  [K in DotPathsFor]: keyof Params<K> extends never ? K : never;
}[DotPathsFor];

export type LowInfer<T> = T & NonNullable<unknown>;

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
    const _fn: ReturnTranslate<T>['to'] = locale => {
      const orderedLocales = new Set([
        ...getOrderedLocaleAndParentLocales(locale),
        ...fallbackLocales.flatMap(getOrderedLocaleAndParentLocales),
      ]);

      for (const locale of orderedLocales) {
        const translationFile = translations[locale as keyof T];
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

    const out: ReturnTranslate<T> = locale => _fn(locale);

    out.to = _fn;

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
