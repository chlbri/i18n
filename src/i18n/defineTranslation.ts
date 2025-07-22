// If the string has no parameters

import type { ExtractParamOptions } from './types';

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
