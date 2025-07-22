import type { Register } from '..';

export type Fn<Args extends any[] = any[], R = any> = (...args: Args) => R;

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

export type Keys = keyof any;

export type Plural<S extends Keys> = {
  [K in S]: Partial<
    Record<Exclude<Intl.LDMLPluralRule, 'other'>, string>
  > & {
    other: `{?} ${string}`; // {?} is a special placeholder for plural rules
    formatter?: Intl.NumberFormatOptions;
    type?: Intl.PluralRuleType;
  };
};

export type DateArgs<S extends Keys> = {
  [K in S]?: Intl.DateTimeFormatOptions;
};

export type ParamOptions = {
  date?: Record<string, Intl.DateTimeFormatOptions>;
  number?: Record<string, Intl.NumberFormatOptions>;
  plural?: Record<
    string,
    Partial<Record<Exclude<Intl.LDMLPluralRule, 'other'>, string>> & {
      other: string;
      formatter?: Intl.NumberFormatOptions;
      type?: Intl.PluralRuleType;
    }
  >;
  enum?: Record<string, Record<string, string>>;
  list?: Record<string, Intl.ListFormatOptions>;
};

type ParseOptionType<
  ParamType extends string,
  ParamName extends string,
> = ParamType extends 'number'
  ? { number?: { [K in ParamName]?: Intl.NumberFormatOptions } }
  : ParamType extends 'plural'
    ? {
        plural: Plural<ParamName>;
      }
    : ParamType extends 'date'
      ? { date?: DateArgs<ParamName> }
      : ParamType extends 'list'
        ? { list?: { [K in ParamName]?: Intl.ListFormatOptions } }
        : ParamType extends 'enum'
          ? { enum: { [K in ParamName]: Record<string, string> } }
          : never;

export type ExtractParamOptions<S extends string> =
  S extends `${string}{${infer Param}}${infer Rest}`
    ? Param extends `${infer Name}:${infer Type}` // If the string contains a parameter
      ? ParseOptionType<Type, Name> & ExtractParamOptions<Rest> // If the string contains a parameter with a type
      : ExtractParamOptions<Rest> // If the string has no parameter type
    : unknown; // If the string has no parameters

type _Translations<R> = R extends [any, any] | (infer S extends string)
  ? [string, ExtractParamOptions<S>] | string
  : R extends object
    ? {
        [K in keyof R]: _Translations<R[K]>;
      }
    : never;

export type Translations = Partial<_Translations<RegisteredTranslations>>;

type Array2 = [string, unknown];

export type I18nMessage = string | Array2;

export type LanguageMessages = {
  [key: string]: I18nMessage | LanguageMessages;
};

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

export type DotPathsFor<T extends object = RegisteredTranslations> = {
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
> = ParamType extends 'plural' | 'number'
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

type NormalizedTranslationAtKey<T> = T extends Array2 ? T : [T, Array2[1]];

type NormalizedTranslationAtKeyWithParams<Key extends string> =
  NormalizedTranslationAtKey<
    TranslationAtKeyWithParams<RegisteredTranslations, Key>
  >;

export type Params<S extends DotPathsFor> = ExtractParamArgs<
  Extract<NormalizedTranslationAtKeyWithParams<S>[0], string>,
  NormalizedTranslationAtKeyWithParams<S>[1] extends {
    enum: infer E;
  }
    ? keyof E extends never
      ? EnumMap
      : E
    : EnumMap
>;

export type PathsWithParams = {
  [K in DotPathsFor]: keyof Params<K> extends never ? never : K;
}[DotPathsFor];

export type PathsWithNoParams = {
  [K in DotPathsFor]: keyof Params<K> extends never ? K : never;
}[DotPathsFor];
