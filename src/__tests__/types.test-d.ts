import type { Fn } from '../bemedev/globals/types';
import type {
  ConfigFrom,
  KeyFrom,
  KeysFrom,
  TranslationFrom,
  TranslationsFrom,
} from '../class';
import type { CustomMessage } from '../message';
import type {
  _Params,
  DateArgs,
  LanguageMessages,
  RequiredTranslations,
} from '../types';
import { machine } from './fixtures';

expectTypeOf<typeof machine.translate>().toExtend<Fn>();
expectTypeOf<typeof machine.translate>().toBeFunction();
expectTypeOf<typeof machine.translateWithLocale>().toExtend<Fn>();

type Param1 = Parameters<typeof machine.translate>[0];
expectTypeOf<Param1>().toExtend<string>();
expectTypeOf<Param1>().toEqualTypeOf<
  | 'localee'
  | 'greetings'
  | 'inboxMessages'
  | 'hobby'
  | 'jerseyNumber'
  | 'nested.greetings'
  | 'nested.one'
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
  | CustomMessage<
      `${string}{name}${string}{lastLoginDate:date}${string}`,
      {
        date?: DateArgs<'lastLoginDate'>;
      }
    >
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

type RT1 = RequiredTranslations<typeof machine.config>;

expectTypeOf<_Params<RT1, 'greetings'>>().toEqualTypeOf<
  _Params<typeof machine.config, 'greetings'>
>();
