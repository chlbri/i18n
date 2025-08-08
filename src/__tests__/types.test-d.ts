import type { types } from '@bemedev/types';
import type {
  ConfigFrom,
  KeyFrom,
  KeysFrom,
  TranslationFrom,
  TranslationsFrom,
} from '../class';
import type { DateArgs, LanguageMessages } from '../types';
import { machine } from './fixtures';

expectTypeOf<typeof machine.translate>().toExtend<types.Fn>();
expectTypeOf<typeof machine.translate>().toBeFunction();
expectTypeOf<typeof machine.translateWithLocale>().toExtend<types.Fn>();

expectTypeOf(machine.translate).parameter(0).toExtend<string>();
expectTypeOf(machine.translate)
  .parameter(0)
  .toEqualTypeOf<
    | 'localee'
    | 'nested.data.langs'
    | 'nested.someArray'
    | 'nested.data.lang'
    | 'greetings'
    | 'hobby'
    | 'nested.greetings'
    | 'nested.one'
    | 'inboxMessages'
    | 'nested'
    | 'jerseyNumber'
    | 'nested.data'
  >();

const greetings = machine.translate('greetings', {
  name: 'John',
  lastLoginDate: new Date('2023-10-01T12:00:00Z'),
}).to;

expectTypeOf(greetings).toEqualTypeOf<
  (locale?: 'en' | 'es-ES' | 'en-US') => string
>();

expectTypeOf(greetings('en')).toEqualTypeOf<string>();

expectTypeOf(machine.translations).toExtend<
  Record<'en' | 'es-ES' | 'en-US', any>
>();
expectTypeOf(machine.translations).toEqualTypeOf<
  TranslationsFrom<typeof machine>
>();

const trnGreet = machine.translations['en-US'].greetings;
expectTypeOf(trnGreet).toEqualTypeOf<
  | string
  | [
      string,
      {
        date?: DateArgs<'lastLoginDate'>;
      },
    ]
  | undefined
>();

expectTypeOf(machine.translations.en).toEqualTypeOf<
  TranslationFrom<typeof machine>
>();

expectTypeOf(machine.translations['en-US']).toEqualTypeOf<
  TranslationFrom<typeof machine>
>();

expectTypeOf(machine.translations['es-ES']).toEqualTypeOf<
  TranslationFrom<typeof machine>
>();

expectTypeOf(machine.keys).toEqualTypeOf<('en' | 'es-ES' | 'en-US')[]>();
expectTypeOf(machine.keys).toEqualTypeOf<KeysFrom<typeof machine>>();

expectTypeOf(machine.__key).toEqualTypeOf<'en' | 'es-ES' | 'en-US'>();
expectTypeOf(machine.__key).toEqualTypeOf<KeyFrom<typeof machine>>();

expectTypeOf(machine.config).toExtend<LanguageMessages>();
expectTypeOf(machine.config).toEqualTypeOf<ConfigFrom<typeof machine>>();
