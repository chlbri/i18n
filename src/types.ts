import { Decompose } from '@bemedev/decompose';
import type { types } from '@bemedev/types';
import type { CustomMessage } from './message';

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
    other: `{?}${string}`; // {?} is a special placeholder for plural rules
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

export type ExtractParamString<S extends string> =
  S extends `${string}{${infer Param}}${infer Rest}`
    ? `${string}{${Param}}${ExtractParamString<Rest>}`
    : string;

export type DefineTransition_F = <
  S extends string,
  O extends ExtractParamOptions<S>,
  S1 extends ExtractParamOptions<S> = ExtractParamOptions<S>,
>(
  ...[string, options]: unknown extends S1
    ? [S, options?: O]
    : object extends S1
      ? [S, options?: O]
      : [S, options: O]
) => CustomMessage<S, O>;

type __Translations<R> =
  R extends CustomMessage<infer S, infer A>
    ? CustomMessage<ExtractParamString<S>, A>
    : R extends [infer A, ...infer Rest]
      ? [__Translations<A>, ...__Translations<Rest>]
      : R extends object
        ? {
            [K in keyof R]?: __Translations<R[K]>;
          }
        : string;

export type _Translations<R extends LanguageMessages> = Extract<
  __Translations<R>,
  LanguageMessages
>;

type _RequiredTranslations<R> =
  R extends CustomMessage<infer S, infer A>
    ? CustomMessage<ExtractParamString<S>, A>
    : R extends [infer A, ...infer Rest]
      ? [_RequiredTranslations<A>, ..._RequiredTranslations<Rest>]
      : R extends object
        ? {
            [K in keyof R]: _RequiredTranslations<R[K]>;
          }
        : string;

export type RequiredTranslations<R extends LanguageMessages> = Extract<
  _RequiredTranslations<R>,
  LanguageMessages
>;

type Array2 = [string, unknown];

export type _I18nMessage = string | CustomMessage;

export type I18nMessage = types.SoA<_I18nMessage | LanguageMessages>;

export type LanguageMessages = {
  [key: string]: I18nMessage;
};

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

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
  T,
  Key extends string,
  D = Decompose<T, { start: false; object: 'both'; sep: '.' }>,
> = Key extends keyof D ? D[Key] : never;

type NormalizedTranslationAtKey<T> =
  T extends CustomMessage<infer S, infer A> ? [S, A] : [T, unknown];

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
  > extends infer A extends NormalizedTranslationAtKeyWithParams<
    Translations,
    S
  >
    ? ExtractParamArgs<
        Extract<A[0], string>,
        A[1] extends {
          enum: infer E;
        }
          ? keyof E extends never
            ? EnumMap
            : E
          : EnumMap
      >
    : never;

export type CheckParams<Translations, S extends string> =
  NormalizedTranslationAtKeyWithParams<
    Translations,
    S
  > extends infer A extends NormalizedTranslationAtKeyWithParams<
    Translations,
    S
  >
    ? unknown extends A[1]
      ? never
      : A[1]
    : never;

export type PathsWithParams<T extends object> = keyof Decompose<
  T,
  { start: false; object: 'key'; sep: '.' }
> extends infer D extends string
  ? {
      [K in D]: keyof _Params<T, Extract<K, string>> extends never
        ? never
        : K;
    } extends infer P
    ? { [key in keyof P]: P[key] }[keyof P]
    : never
  : never;

export type PathsWithNoParams<T extends object> = keyof Decompose<
  T,
  { start: false; object: 'key'; sep: '.' }
> extends infer D extends string
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

export type ArrayKey = `${string}[${number}]${string}`;

export type Translate_F<
  R extends LanguageMessages,
  Keys extends string,
  D = Decompose<R, { start: false; object: 'both'; sep: '.' }>,
  Pn extends string = PathsWithNoParams<R>,
  Pp extends string = PathsWithParams<R>,
  KS extends keyof D & string = Exclude<keyof D, Pn | Pp> & string,
> = <const S extends KS | Pp | Pn>(
  key: S,
  ...args: S extends Pp
    ? [_Params<R, S>]
    : Extract<Pp, `${S}.${string}`> extends never
      ? []
      : [
          args: {
            [K in Extract<Pp, `${S}.${string}`>]: _Params<R, K>;
          },
        ]
) => {
  (locale?: Keys): S extends KS ? D[S] : string;
  to: (locale?: Keys) => S extends KS ? D[S] : string;
};

export type Translate_F2<
  R extends LanguageMessages,
  D = Decompose<R, { start: false; object: 'both'; sep: '.' }>,
  Pn extends string = PathsWithNoParams<R>,
  Pp extends string = PathsWithParams<R>,
  KS extends keyof D & string = Exclude<keyof D, Pn | Pp> & string,
> = {
  <const S extends KS | Pp | Pn>(
    key: S,
    ...args: S extends Pp
      ? [_Params<R, S>]
      : Extract<Pp, `${S}.${string}`> extends never
        ? []
        : [
            args: {
              [K in Extract<Pp, `${S}.${string}`>]: _Params<R, K>;
            },
          ]
  ): S extends KS ? D[S] : string;
  config: R;
};

export type KeyU<S extends types.Keys> = Record<S, unknown>;

export type Keys18n =
  | 'keys'
  | 'config'
  | 'translations'
  | '__translation'
  | '__key'
  | 'provideTranslation'
  | 'translateWithLocale'
  | 'translate';

export type Simple18 = Record<Keys18n, any>;

export type infer18<T extends Simple18> = RequiredTranslations<
  T['config']
>;
