import type { Plural } from './types';

type ParseOptionType<
  ParamType extends string,
  ParamName extends string,
> = ParamType extends 'plural'
  ? {
      plural: Plural<ParamName>;
    }
  : ParamType extends 'date'
    ? { date?: { [K in ParamName]?: Intl.DateTimeFormatOptions } }
    : ParamType extends 'list'
      ? { list?: { [K in ParamName]?: Intl.ListFormatOptions } }
      : ParamType extends 'enum'
        ? { enum: { [K in ParamName]: Record<string, string> } }
        : never;

type ExtractParamOptions<S extends string> =
  S extends `${string}{${infer Param}}${infer Rest}`
    ? Param extends `${infer Name}:${infer Type}` // If the string contains a parameter
      ? ParseOptionType<Type, Name> & ExtractParamOptions<Rest> // If the string contains a parameter with a type
      : ExtractParamOptions<Rest> // If the string has no parameter type
    : unknown; // If the string has no parameters

export const defineTranslation = <
  S extends string,
  O extends ExtractParamOptions<S>,
>(
  string: S,
  options: O,
): [S, O] => {
  return [string, options];
};

export const dt = defineTranslation;
