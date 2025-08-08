import { typings } from '@bemedev/types';
import { addFn, defineTranslation, getTranslation } from './helpers';
import type {
  _Translations,
  KeyU,
  LanguageMessages,
  Paths,
  Translate_F,
} from './types';

class I18n<
  const R extends LanguageMessages,
  const Keys extends string[],
  Tr extends Partial<_Translations<R>> = Partial<_Translations<R>>,
> {
  get config() {
    return this._config;
  }

  get translations() {
    return this.#translations as Record<Keys[number], Tr>;
  }

  get keys() {
    return Object.keys(this.#translations) as Keys[number][];
  }

  /**
   * @deprecated Used only for typing (TypeScript). Do not use this property at runtime.
   */
  get __key() {
    return typings.commons<Keys[number]>();
  }

  /**
   * @deprecated Used only for typing (TypeScript). Do not use this property at runtime.
   */
  get __translation() {
    return typings.commons<Tr>();
  }

  constructor(
    private _config: R,
    ...initials: Keys
  ) {
    this.#initials = initials;
    for (const initial of this.#initials) {
      this.#translations[initial] = _config as unknown as Tr;
    }
  }

  #translations: Record<string, Tr> = {};

  #initials: Keys;

  #addTranslation = <K extends string, const V extends Tr>(
    key: K,
    func: ((define: typeof defineTranslation) => V) | V,
  ) => {
    const isFunction = typeof func === 'function';
    if (isFunction)
      this.#translations[key] = (func as any)(defineTranslation);
    else this.#translations[key] = func;
  };

  provideTranslation = <K extends string, V extends Tr>(
    key: K,
    func: ((define: typeof defineTranslation) => V) | V,
  ) => {
    const out = new I18n<R, [...Keys, K]>(
      this._config,
      ...(this.#initials as any),
    );

    out.#translations = { ...this.#translations };

    out.#addTranslation(key, func);

    return out;
  };

  #getOrderedLocaleAndParentLocales = (locale?: string) => {
    const locales: string[] = [];
    if (typeof locale !== 'string') return locales;
    let parentLocale = locale;
    while (parentLocale !== '') {
      locales.push(parentLocale);
      parentLocale = parentLocale.replace(/-?[^-]+$/, '');
    }
    return locales;
  };

  translateWithLocale = (locale: Keys[number], values: Paths<R>) => {
    const orderedLocales = new Set([
      ...this.#getOrderedLocaleAndParentLocales(locale),
      ...Object.keys(this.#translations).flatMap(
        this.#getOrderedLocaleAndParentLocales,
      ),
    ]);

    let out1 = '';

    for (const locale of orderedLocales) {
      const translationFile = this.#translations[locale];
      if (translationFile == null) continue;
      const __values: any = values;
      const _values: any =
        typeof __values === 'string'
          ? { key: __values, args: {} }
          : __values;

      const translation = getTranslation(
        locale,
        translationFile as any,
        _values.key,
        _values.args,
      );
      if (translation) {
        out1 = translation;
        break;
      }
    }

    return out1;
  };

  //@ts-expect-error for build
  translate: Translate_F<R, Keys[number]> = (key, args) => {
    const _args = {
      key,
      args,
    } as any;

    const to = (locale: Keys[number]) =>
      this.translateWithLocale(locale, _args);

    return addFn(to, { to });
  };
}

// #region types
export { type I18n };

export type ConfigFrom<T extends KeyU<'config'>> = T['config'];

export type KeysFrom<T extends KeyU<'keys'>> = T['keys'];

export type KeyFrom<T extends KeyU<'__key'>> = T['__key'];

export type TranslationsFrom<T extends KeyU<'translations'>> =
  T['translations'];

export type TranslationFrom<T extends KeyU<'__translation'>> =
  T['__translation'];
// #endregion

export const create = <
  const K extends [string, ...string[]],
  const R extends LanguageMessages,
>(
  func: ((define: typeof defineTranslation) => R) | R,
  ...fallbacks: K
) => {
  const isFunction = typeof func === 'function';
  let config: R;
  if (isFunction) config = func(defineTranslation);
  else config = func;

  const out = new (I18n as any)(config, ...fallbacks);
  return out as I18n<R, K>;
};
