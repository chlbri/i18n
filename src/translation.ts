import { create } from './class';
import { defineTranslation } from './helpers';
import {
  infer18,
  type LanguageMessages,
  type RequiredTranslations,
  type Simple18,
  type Translate_F2,
} from './types';

const _translation = <const R extends LanguageMessages>(
  config: R,
  locale: string,
) => {
  const _class = create(config, locale);

  const out = (...args: any[]) =>
    (_class as any).translate(...args).to(locale);

  return out as Translate_F2<R>;
};

/**
 * Creates a translation object from a function or object.
 * Utility helper to create type-safe translations that match a root config.
 *
 * @param func - A function that receives defineTranslation or a plain translation object
 * @param _ - Optional root config for type inference (not used at runtime)
 * @returns The resolved translation object
 */
export const translation = <const R extends LanguageMessages>(
  func: ((define: typeof defineTranslation) => R) | R,
  locale = 'en-US',
) => {
  const isFunction = typeof func === 'function';
  const config = isFunction ? func(defineTranslation) : func;

  return _translation(config, locale);
};

translation.derived = <const R extends LanguageMessages>(
  func:
    | ((define: typeof defineTranslation) => RequiredTranslations<R>)
    | RequiredTranslations<R>,
  locale = 'en-US',
) => {
  return translation(func, locale);
};

translation.fromMachine = <const T extends Simple18>(
  func: ((define: typeof defineTranslation) => infer18<T>) | infer18<T>,
  locale = 'en-US',
) => translation(func, locale);
