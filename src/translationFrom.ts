import { create } from './class';
import { defineTranslation } from './helpers';
import type {
  _Translations,
  LanguageMessages,
  Translate_F2,
} from './types';

const _translation = <
  const R extends LanguageMessages,
  Tr extends Partial<_Translations<R>> = Partial<_Translations<R>>,
>(
  config: R,
  func?: ((define: typeof defineTranslation) => Tr) | Tr,
) => {
  const _class = create(config, 'any').provideTranslation(
    'any2',
    func ?? {},
  );

  const out = (...args: any[]) =>
    (_class as any).translate(...args).to('any2');

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
export const translationFrom = <const R extends LanguageMessages>(
  func: ((define: typeof defineTranslation) => R) | R,
) => {
  const isFunction = typeof func === 'function';
  const config = isFunction ? func(defineTranslation) : func;

  return _translation(config);
};

translationFrom.complete = <
  const R extends LanguageMessages,
  Tr extends Partial<_Translations<R>> = Partial<_Translations<R>>,
>(
  config: R,
  func: ((define: typeof defineTranslation) => Tr) | Tr,
) => _translation(config, func);
