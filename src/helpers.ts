import type {
  ExtractParamOptions,
  Fn,
  LanguageMessages,
  ParamOptions,
} from './types';

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

export function getTranslation(
  locale: string,
  translations: LanguageMessages,
  key: string,
  args?: any,
) {
  const translation = getTranslationByKey(translations, key);
  const argObj = args || {};

  if (typeof translation === 'string') {
    return performSubstitution(locale, translation, argObj, {});
  }

  if (Array.isArray(translation)) {
    const canReturn =
      translation.length !== 2 || typeof translation[1] === 'string';

    if (canReturn) return translation;
    const [str, options] = translation;

    return performSubstitution(locale, str, argObj, options);
  }

  const isObject = typeof translation === 'object' && translation !== null;
  if (isObject) {
    const obj: any = {};
    const entries = Object.entries(translation)
      .filter(([, v]) => {
        const notValid =
          Array.isArray(v) && v.length === 2 && typeof v[1] === 'object';
        return !notValid;
      })
      .map(([k]) => {
        return [
          k,
          getTranslation(locale, translations, `${key}.${k}`, {}),
        ] as const;
      });
    entries.forEach(([k, v]) => {
      obj[k] = v;
    });

    return obj;
  }

  return undefined;
}

function getTranslationByKey(obj: LanguageMessages, key: string) {
  const keys = key.split('.');
  let currentObj: any = obj;
  const len = keys.length - 1;

  let out = undefined;

  for (let i = 0; i <= len; i++) {
    const k = keys[i];
    const newObj = currentObj[k];
    if (!newObj) return undefined;

    const canReturn =
      typeof newObj === 'string' ||
      (Array.isArray(newObj) &&
        newObj.length === 2 &&
        typeof newObj[0] === 'string');

    if (canReturn) {
      out = newObj;
      break;
    }
    if (i === len) {
      out = newObj;
      break;
    }

    currentObj = newObj;
  }

  return out;
}

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
