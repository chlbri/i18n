import { Decompose } from '@bemedev/decompose';
import type { types } from '@bemedev/types';

export type Fn<Args extends any[] = any[], R = any> = (...args: Args) => R;

type StateValeMap = {
  [key: string]: StateValue;
};

export type StateValue = string | StateValeMap;

export type SoA<T> = T | T[];

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

export type _Translations<R> = R extends
  | [infer S extends string, infer A]
  | (infer S extends string)
  ? ExtractParamOptions<S> extends infer E
    ?
        | [string, E]
        | (E extends types.Ru
            ? keyof types.NotSubTypeLow<E, undefined> extends undefined
              ? string
              : never
            : string)
    : A extends string
      ? [string, string]
      : string
  : R extends string[]
    ? types.TupleOf<string, R['length']>
    : R extends object
      ? {
          [K in keyof R]?: _Translations<R[K]>;
        }
      : never;

// export type MakeSomeR<T> = {
//   [K in keyof T]: T[K] extends Array<any>
//     ? T[K]
//     : T[K] extends object
//       ? MakeSomeR<T[K]>
//       : any;
// };

// type TT = types.DeepRequired<Translations>['nested']['one']

type Array2 = [string, unknown];

export type I18nMessage = string | Array2 | string[];

export type LanguageMessages = {
  [key: string]: I18nMessage | LanguageMessages;
};

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

export type DotPathsFor<T extends object> = {
  [K in keyof T]: T[K] extends I18nMessage
    ? K
    : T[K] extends object
      ? Join<K, DotPathsFor<T[K]>>
      : never;
}[keyof T];

export type _Soften<T> = {
  [K in keyof T]: T[K] extends Array2
    ? T[K]
    : T[K] extends object
      ? _Soften<T[K]>
      : string;
};

// export type Soften = _Soften;

export type _ObjectDotKeys<T> = {
  [K in keyof T]: T[K] extends Array2
    ? never
    : T[K] extends object
      ? K | Join<K, _ObjectDotKeys<T[K]>>
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

type NormalizedTranslationAtKeyWithParams<
  Translations,
  Key extends string,
> = NormalizedTranslationAtKey<
  TranslationAtKeyWithParams<Translations, Key>
>;

export type _Params<Translations, S extends string> =
  NormalizedTranslationAtKeyWithParams<
    Translations,
    S
  >[0] extends Array<string>
    ? unknown
    : ExtractParamArgs<
        Extract<
          NormalizedTranslationAtKeyWithParams<Translations, S>[0],
          string
        >,
        NormalizedTranslationAtKeyWithParams<Translations, S>[1] extends {
          enum: infer E;
        }
          ? keyof E extends never
            ? EnumMap
            : E
          : EnumMap
      >;

type PathsWithParams<T extends object> =
  DotPathsFor<T> extends infer D extends string
    ? {
        [K in D]: keyof _Params<T, Extract<K, string>> extends never
          ? never
          : K;
      } extends infer P
      ? { [key in keyof P]: P[key] }[keyof P]
      : never
    : never;

type PathsWithNoParams<T extends object> =
  DotPathsFor<T> extends infer D extends string
    ? {
        [K in D]: keyof _Params<T, Extract<K, string>> extends never
          ? K
          : never;
      } extends infer P
      ? { [key in keyof P]: P[key] }[keyof P]
      : never
    : never;

export type Paths<
  T extends object,
  K extends Extract<keyof T, string> = Extract<keyof T, string>,
> =
  K extends PathsWithParams<T>
    ? { key: PathsWithParams<T>; args: _Params<T, K> }
    :
        | { key: PathsWithNoParams<T>; args: _Params<T, K> }
        | PathsWithNoParams<T>;

type ReturnTranslate1<S extends string> = {
  (locale?: S): string;
  to: (locale?: S) => string;
};

type ArrayKey = `${string}[${number}]${string}`;

export type Translate_F<
  R extends LanguageMessages,
  Keys extends string,
  D = Decompose<R, { start: false; object: 'object'; sep: '.' }>,
  KS extends keyof D = Exclude<keyof D, ArrayKey>,
> = {
  <S extends PathsWithNoParams<R>>(key: S): ReturnTranslate1<Keys>;
  <S extends PathsWithParams<R>, A extends _Params<R, S>>(
    key: S,
    args: A,
  ): ReturnTranslate1<Keys>;
  <S extends KS>(
    key: S,
  ): {
    (locale?: Keys): D[S];
    to: (locale?: Keys) => D[S];
  };
};

export type Translate_F2<
  R extends LanguageMessages,
  D = Decompose<R, { start: false; object: 'object'; sep: '.' }>,
  KS extends keyof D = Exclude<keyof D, ArrayKey>,
> = {
  <S extends PathsWithNoParams<R>>(key: S): string;
  <S extends PathsWithParams<R>, A extends _Params<R, S>>(
    key: S,
    args: A,
  ): string;
  <S extends KS>(key: S): string;
};

export type KeyU<S extends types.Keys> = Record<S, unknown>;
