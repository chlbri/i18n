import { decompose } from '@bemedev/decompose';
import { CustomMessage } from './message';
import type {
  DefineTransition_F,
  Fn,
  LanguageMessages,
  ParamOptions,
} from './types';

export const defineTranslation: DefineTransition_F = (...args) => {
  return new CustomMessage<any, any>(args[0], args[1] || {});
};

export const dt = defineTranslation;

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

export const innerArgs = (translation: any, KEY: string, args?: any) => {
  const isCustom = translation instanceof CustomMessage;
  const arg = isCustom ? args?.[KEY] : {};
  return arg;
};

export function getTranslation(
  locale: string,
  translations: LanguageMessages,
  key: string,
  args?: any,
): any {
  const translation = getTranslationByKey(translations, key);
  const argObj = args || {};

  if (typeof translation === 'string') {
    return performSubstitution(locale, translation, argObj, {});
  }

  if (translation instanceof CustomMessage) {
    const { translate, args } = translation;

    return performSubstitution(locale, translate, argObj, args);
  }

  if (Array.isArray(translation)) {
    return translation.map((t, index) => {
      const KEY = `${key}.[${index}]`;

      return getTranslation(
        locale,
        translations,
        KEY,
        innerArgs(t, KEY, args),
      );
    });
  }

  const isObject = typeof translation === 'object' && translation !== null;
  if (isObject) {
    const obj: any = {};
    const entries = Object.entries(translation).map(([k, t]) => {
      const KEY = `${key}.${k}`;

      const value = getTranslation(
        locale,
        translations,
        KEY,
        innerArgs(t, KEY, args),
      );

      return [k, value] as const;
    });

    entries.forEach(([k, v]) => {
      obj[k] = v;
    });

    return obj;
  }

  return undefined;
}

/**
 * Retrieves a translation value from a nested language messages object by flattening it and accessing the specified key.
 *
 * Use {@link decompose.low}
 *
 * @param obj - The language messages object to search in, typically a nested structure of translations.
 * @param key - The dot-separated key path to the desired translation (e.g., "section.subsection.key").
 * @returns The translation value associated with the key, or undefined if not found.
 */
const getTranslationByKey = (obj: LanguageMessages, key: string) => {
  const decomposed = decompose.low(obj, {
    start: false,
    object: 'both',
    sep: '.',
  });

  return decomposed[key];
};

function performSubstitution(
  locale: string,
  str: string,
  args: Record<string, any>,
  translationParams: ParamOptions,
) {
  const entries = Object.entries(args);

  return entries.reduce((result, [argKey, argValue]) => {
    const match = result.match(`{${argKey}:?([^}]*)?}`);
    const [replaceKey, argType] = match!;

    switch (argType) {
      case 'plural': {
        const pluralMap = translationParams.plural?.[argKey];
        const pluralRules = new Intl.PluralRules(locale, {
          type: pluralMap?.type,
        });

        const replacement = pluralMap![pluralRules.select(argValue)]!;

        const numberFormatter = new Intl.NumberFormat(
          locale,
          translationParams.plural?.[argKey]?.formatter,
        );
        return result.replace(
          replaceKey,
          replacement.replace(`{?}`, numberFormatter.format(argValue)),
        );
      }
      case 'enum': {
        const replacement = translationParams.enum![argKey][argValue];

        return result.replace(replaceKey, replacement);
      }
      case 'number': {
        const numberFormat = new Intl.NumberFormat(
          locale,
          translationParams.number?.[argKey],
        );

        return result.replace(replaceKey, numberFormat.format(argValue));
      }
      case 'list': {
        const formatter = new Intl.ListFormat(
          locale,
          translationParams.list?.[argKey],
        );
        return result.replace(replaceKey, formatter.format(argValue));
      }
      case 'date': {
        const dateFormat = new Intl.DateTimeFormat(
          locale,
          translationParams.date?.[argKey],
        );
        return result.replace(replaceKey, dateFormat.format(argValue));
      }
      default:
        return result.replace(replaceKey, String(argValue));
    }
  }, str);
}

export const createConfig = <const R extends LanguageMessages>(
  func: ((define: typeof defineTranslation) => R) | R,
) => {
  const isFunction = typeof func === 'function';
  let config: R;
  if (isFunction) config = func(defineTranslation);
  else config = func;

  return config;
};
