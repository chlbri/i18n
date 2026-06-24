import type { Keys, SoA } from './bemedev/globals/types';
import type { CustomMessage } from './message';

type StateValeMap = {
  [key: string]: StateValue;
};

export type StateValue = string | StateValeMap;

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

export type _I18nMessage = string | CustomMessage;

export type I18nMessage = SoA<_I18nMessage>;

export type LanguageMessages = {
  [key: string]: _I18nMessage;
};

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

type NormalizedTranslationAtKey<T> =
  T extends CustomMessage<infer S, infer A> ? [S, A] : [T, unknown];

type NormalizedTranslationAtKeyWithParams<
  Translations extends LanguageMessages,
  Key extends keyof Translations,
> = NormalizedTranslationAtKey<Translations[Key]>;

export type _Params<
  Translations extends LanguageMessages,
  S extends keyof Translations,
> =
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

export type CheckParams<
  Translations extends LanguageMessages,
  S extends keyof Translations,
> =
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

export type PathsWithParams<T extends LanguageMessages> =
  keyof T extends infer D extends string
    ? D extends keyof T
      ? keyof _Params<T, D> extends never
        ? never
        : D
      : never
    : never;

export type PathsWithNoParams<T extends LanguageMessages> =
  keyof T extends infer D extends string
    ? D extends keyof T & string
      ? keyof _Params<T, D> extends never
        ? D
        : never
      : never
    : never;

export type Paths<
  T extends LanguageMessages,
  Pp extends keyof T = PathsWithParams<T>,
  Pn = Exclude<keyof T, Pp>,
> = { key: Pp; args: _Params<T, Pp> } | { key: Pn; args?: never } | Pn;

export type ArrayKey = `${string}[${number}]${string}`;

export type Translate_F<
  R extends LanguageMessages,
  Keys extends string,
  Pp extends keyof R = PathsWithParams<R>,
> = <const S extends keyof R>(
  key: S,
  ...args: S extends Pp ? [_Params<R, S>] : []
) => {
  (locale?: Keys): string;
  to: (locale?: Keys) => string;
};

export type Translate_F2<
  R extends LanguageMessages,
  Pp extends string = PathsWithParams<R>,
> = {
  <const S extends keyof R>(
    key: S,
    ...args: S extends Pp ? [_Params<R, S>] : []
  ): string;
  config: R;
};

export type KeyU<S extends Keys> = Record<S, unknown>;

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
