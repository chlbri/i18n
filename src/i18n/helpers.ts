import { defineTranslation } from './defineTranslation';
import type { Fn, LanguageMessages, Translations } from './types';

export type FnBasic<Main extends Fn, Tr extends object> = Tr & Main;

export const addFn = <Main extends Fn, const Tr extends object = object>(
  main: Main,
  extensions?: Tr,
): FnBasic<Main, Tr> => {
  const out: any = main;

  if (extensions) {
    Object.assign(out, extensions);
  }

  return out;
};

export type CreateTranslations_F<TT = LanguageMessages> = <
  const T extends TT,
>(
  func: ((define: typeof defineTranslation) => T) | T,
) => T;

export const createRootTanslations: CreateTranslations_F = func => {
  const isFunction = typeof func === 'function';
  if (isFunction) {
    return func(defineTranslation);
  }
  return func;
};

export const createTranslations: CreateTranslations_F<Translations> =
  createRootTanslations;
