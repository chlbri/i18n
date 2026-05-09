import { createTests } from '@bemedev/dev-utils/vitest-extended';
import { translation } from '../translation';
import type { machine } from './fixtures';

describe('#01 => translation', () => {
  const { acceptation } = createTests(translation);

  describe('#01 => Acceptation', acceptation);

  // Test with plain object
  describe('#02 => Basic translationFrom with plain object', () => {
    const translate = translation(
      {
        greeting: 'Hello',
        farewell: 'Goodbye',
        withParam: 'Hello {name}!',
        nested: {
          welcome: 'Welcome back',
          deep: {
            message: 'Deep message',
          },
        },
      },
      'en',
    );

    describe('#01 => should translate simple keys', () => {
      test('#01 => greeting key', () => {
        expect(translate('greeting')).toBe('Hello');
      });

      test('#02 => farewell key', () => {
        expect(translate('farewell')).toBe('Goodbye');
      });
    });

    test('#02 => should translate with parameters', () => {
      expect(translate('withParam', { name: 'John' })).toBe('Hello John!');
    });

    describe('#03 => should translate nested keys', () => {
      test('#01 => nested welcome', () => {
        expect(translate('nested.welcome')).toBe('Welcome back');
      });

      test('#02 => deep nested message', () => {
        expect(translate('nested.deep.message')).toBe('Deep message');
      });
    });

    test('#04 => should return nested objects when accessing partial paths', () => {
      const nested = translate('nested');
      expect(nested).toEqual({
        welcome: 'Welcome back',
        deep: { message: 'Deep message' },
      });
    });
  });

  // Test with function using defineTranslation
  describe('#03 => translationFrom with defineTranslation function', () => {
    const translate = translation(
      dt => ({
        greeting: 'Hello {name}!',
        dateMessage: dt('Today is {date:date}', {
          date: { date: { dateStyle: 'long' } },
        }),
        pluralMessage: dt('You have {count:plural}', {
          plural: {
            count: {
              one: '1 item',
              zero: '0 items',
              other: '{?} items',
            },
          },
        }),
        enumMessage: dt('Status: {status:enum}', {
          enum: {
            status: {
              pending: 'Pending',
              completed: 'Completed',
            },
          },
        }),
        numberFormat: dt('Price: {amount:number}', {
          number: {
            amount: {
              style: 'currency',
              currency: 'USD',
            },
          },
        }),
        listFormat: dt('Users: {users:list}', {
          list: {
            users: { style: 'long', type: 'conjunction' },
          },
        }),
      }),
      'en',
    );

    test('#01 => should handle simple string interpolation', () => {
      expect(translate('greeting', { name: 'Alice' })).toBe(
        'Hello Alice!',
      );
    });

    test('#02 => should handle date formatting', () => {
      const date = new Date('2025-01-01T12:00:00Z');
      const result = translate('dateMessage', { date });
      expect(result).toMatch(/Today is/);
      expect(result).toMatch(/2025/);
    });

    describe('#03 => should handle plural formatting', () => {
      test('#01 => singular form (count = 1)', () => {
        expect(translate('pluralMessage', { count: 1 })).toBe(
          'You have 1 item',
        );
      });

      test('#02 => plural form (count = 5)', () => {
        expect(translate('pluralMessage', { count: 5 })).toBe(
          'You have 5 items',
        );
      });

      test('#03 => plural form (count = 0)', () => {
        expect(translate('pluralMessage', { count: 0 })).toBe(
          'You have 0 items',
        );
      });
    });

    describe('#04 => should handle enum formatting', () => {
      test('#01 => pending status', () => {
        expect(translate('enumMessage', { status: 'pending' })).toBe(
          'Status: Pending',
        );
      });

      test('#02 => completed status', () => {
        expect(translate('enumMessage', { status: 'completed' })).toBe(
          'Status: Completed',
        );
      });
    });

    describe('#05 => should handle number formatting', () => {
      test('#01 => contains price label', () => {
        const result = translate('numberFormat', { amount: 123.45 });
        expect(result).toMatch(/Price:/);
      });

      test('#02 => contains dollar sign for USD', () => {
        const result = translate('numberFormat', { amount: 123.45 });
        expect(result).toMatch(/\$/); // Should include dollar sign for USD
      });
    });

    test('#06 => should handle list formatting', () => {
      const result = translate('listFormat', {
        users: ['Alice', 'Bob', 'Charlie'],
      });
      expect(result).toBe('Users: Alice, Bob, and Charlie');
    });
  });

  // Test edge cases
  describe('#04 => Edge cases for translationFrom', () => {
    test('#01 => should handle function returning empty object', () => {
      const translate = translation(() => ({}));
      // Should not throw when calling with invalid keys
      expect(() => (translate as any)('nonexistent')).not.toThrow();
    });

    describe('#02 => should handle complex nested structures', () => {
      const translate = translation({
        level1: {
          level2: {
            level3: 'Deep nested value',
            array: ['item1', 'item2'],
          },
          simple: 'Simple value',
        },
        root: 'Root level',
      });

      test('#01 => deep nested value access', () => {
        expect(translate('level1.level2.level3')).toBe(
          'Deep nested value',
        );
      });

      test('#02 => simple nested value access', () => {
        expect(translate('level1.simple')).toBe('Simple value');
      });

      test('#03 => root level access', () => {
        expect(translate('root')).toBe('Root level');
      });

      test('#04 => array value access', () => {
        expect(translate('level1.level2.array')).toEqual([
          'item1',
          'item2',
        ]);
      });
    });
  });
});

const derived1 = translation.derived<typeof machine.config>(
  dt => ({
    localee: 'es-ES',
    greetings: dt(
      '¡Hola {name}! Tu última conexión fue el {lastLoginDate:date}.',
      {
        date: {
          lastLoginDate: {
            month: '2-digit',
            year: 'numeric',
            day: '2-digit',
          },
        },
      },
    ),

    fdfd: '',
    inboxMessages: dt('Hola {name}, tienes {messages:plural}.', {
      plural: {
        messages: {
          one: '1 mensaje',
          other: '{?} mensajes',
          two: '2 mensajes',
        },
      },
    }),

    hobby: dt('Elegiste {hobby:enum} como tu pasatiempo.', {
      enum: {
        hobby: { runner: 'corredor', developer: 'desarrollador' },
      },
    }),

    nested: {
      greetings: dt('¡Hola {names:list}!'),
      data: { lang: 'es', langs: ['fr', 'gb', 'en'] },
      one: dt('Line {LINE} is empty', {}),
      someArray: ['cadena1', 'cadena2'],
    },

    jerseyNumber: dt('Tu número es {jersey:number}.', {
      number: {
        jersey: {},
      },
    }),
  }),
  'es-ES',
);
describe('#02 => translation.derived', () => {
  derived1('localee');

  derived1('nested', {
    'nested.greetings': { names: ['Ana', 'Luis', 'María'] },
    'nested.one': { LINE: 'string' },
  });

  const { acceptation, success } = createTests(derived1 as any);

  describe('#00 => Acceptation', acceptation);

  describe(
    '#01 => Success',
    success(
      {
        invite: 'localee',
        parameters: 'localee',
        expected: 'es-ES',
      },
      {
        invite: 'greetings',
        parameters: [
          'greetings',
          {
            name: 'Juan',
            lastLoginDate: new Date('2024-06-15T12:00:00Z'),
          },
        ],
        expected: '¡Hola Juan! Tu última conexión fue el 15/06/2024.',
      },
      {
        invite: 'inboxMessages with one message',
        parameters: ['inboxMessages', { name: 'Juan', messages: 1 }],
        expected: 'Hola Juan, tienes 1 mensaje.',
      },
      {
        invite: 'inboxMessages with multiple messages',
        parameters: ['inboxMessages', { name: 'Juan', messages: 3 }],
        expected: 'Hola Juan, tienes 3 mensajes.',
      },
      {
        invite: 'inboxMessages with 0 messages',
        parameters: ['inboxMessages', { name: 'Juan', messages: 0 }],
        expected: 'Hola Juan, tienes 0 mensajes.',
      },
      {
        invite: 'hobby as developer',
        parameters: ['hobby', { hobby: 'developer' }],
        expected: 'Elegiste desarrollador como tu pasatiempo.',
      },
      {
        invite: 'hobby as runner',
        parameters: ['hobby', { hobby: 'runner' }],
        expected: 'Elegiste corredor como tu pasatiempo.',
      },
      {
        invite: 'nested.greetings',
        parameters: [
          'nested.greetings',
          { names: ['Ana', 'Luis', 'María'] },
        ],
        expected: '¡Hola Ana, Luis y María!',
      },
      {
        invite: 'jerseyNumber',
        parameters: ['jerseyNumber', { jersey: 23.0001 }],
        expected: 'Tu número es 23.',
      },
      {
        invite: 'nested.data.lang',
        parameters: 'nested.data.lang',
        expected: 'es',
      },
      {
        invite: 'nested.data',
        parameters: 'nested.data',
        expected: { lang: 'es', langs: ['fr', 'gb', 'en'] },
      },
    ),
  );
});

describe('#03 => translation.derived #2', () => {
  const func = translation.derived<typeof derived1.config>(
    dt => ({
      localee: 'es-ES',
      greetings: dt(
        '¡Hola {name}! Tu última conexión fue el {lastLoginDate:date}.',
        {
          date: {
            lastLoginDate: {
              month: '2-digit',
              year: 'numeric',
              day: '2-digit',
            },
          },
        },
      ),

      fdfd: '',
      inboxMessages: dt('Hola {name}, tienes {messages:plural}.', {
        plural: {
          messages: {
            one: '1 mensaje',
            other: '{?} mensajes',
            two: '2 mensajes',
          },
        },
      }),

      hobby: dt('Elegiste {hobby:enum} como tu pasatiempo.', {
        enum: {
          hobby: { runner: 'corredor', developer: 'desarrollador' },
        },
      }),

      nested: {
        greetings: dt('¡Hola {names:list}!'),
        data: { lang: 'es', langs: ['fr', 'gb', 'en'] },
        one: dt('Line {LINE} is empty', {}),
        someArray: ['cadena1', 'cadena2'],
      },

      jerseyNumber: dt('Tu número es {jersey:number}.', {
        number: {
          jersey: {},
        },
      }),
    }),
    'es-ES',
  );

  func('localee');

  func('nested', {
    'nested.greetings': { names: ['Ana', 'Luis', 'María'] },
    'nested.one': { LINE: 'string' },
  });

  const { acceptation, success } = createTests(func as any);

  describe('#00 => Acceptation', acceptation);

  describe(
    '#01 => Success',
    success(
      {
        invite: 'localee',
        parameters: 'localee',
        expected: 'es-ES',
      },
      {
        invite: 'greetings',
        parameters: [
          'greetings',
          {
            name: 'Juan',
            lastLoginDate: new Date('2024-06-15T12:00:00Z'),
          },
        ],
        expected: '¡Hola Juan! Tu última conexión fue el 15/06/2024.',
      },
      {
        invite: 'inboxMessages with one message',
        parameters: ['inboxMessages', { name: 'Juan', messages: 1 }],
        expected: 'Hola Juan, tienes 1 mensaje.',
      },
      {
        invite: 'inboxMessages with multiple messages',
        parameters: ['inboxMessages', { name: 'Juan', messages: 3 }],
        expected: 'Hola Juan, tienes 3 mensajes.',
      },
      {
        invite: 'inboxMessages with 0 messages',
        parameters: ['inboxMessages', { name: 'Juan', messages: 0 }],
        expected: 'Hola Juan, tienes 0 mensajes.',
      },
      {
        invite: 'hobby as developer',
        parameters: ['hobby', { hobby: 'developer' }],
        expected: 'Elegiste desarrollador como tu pasatiempo.',
      },
      {
        invite: 'hobby as runner',
        parameters: ['hobby', { hobby: 'runner' }],
        expected: 'Elegiste corredor como tu pasatiempo.',
      },
      {
        invite: 'nested.greetings',
        parameters: [
          'nested.greetings',
          { names: ['Ana', 'Luis', 'María'] },
        ],
        expected: '¡Hola Ana, Luis y María!',
      },
      {
        invite: 'jerseyNumber',
        parameters: ['jerseyNumber', { jersey: 23.0001 }],
        expected: 'Tu número es 23.',
      },
      {
        invite: 'nested.data.lang',
        parameters: 'nested.data.lang',
        expected: 'es',
      },
      {
        invite: 'nested.data',
        parameters: 'nested.data',
        expected: { lang: 'es', langs: ['fr', 'gb', 'en'] },
      },
    ),
  );
});

describe('#04 => translation and derive', () => {
  const func = translation(derived1.config, 'es-ES');

  func('localee');

  func('nested', {
    'nested.greetings': { names: ['Ana', 'Luis', 'María'] },
    'nested.one': { LINE: 'string' },
  });

  const { acceptation, success } = createTests(func as any);

  describe('#00 => Acceptation', acceptation);

  describe(
    '#01 => Success',
    success(
      {
        invite: 'localee',
        parameters: 'localee',
        expected: 'es-ES',
      },
      {
        invite: 'greetings',
        parameters: [
          'greetings',
          {
            name: 'Juan',
            lastLoginDate: new Date('2024-06-15T12:00:00Z'),
          },
        ],
        expected: '¡Hola Juan! Tu última conexión fue el 15/06/2024.',
      },
      {
        invite: 'inboxMessages with one message',
        parameters: ['inboxMessages', { name: 'Juan', messages: 1 }],
        expected: 'Hola Juan, tienes 1 mensaje.',
      },
      {
        invite: 'inboxMessages with multiple messages',
        parameters: ['inboxMessages', { name: 'Juan', messages: 3 }],
        expected: 'Hola Juan, tienes 3 mensajes.',
      },
      {
        invite: 'inboxMessages with 0 messages',
        parameters: ['inboxMessages', { name: 'Juan', messages: 0 }],
        expected: 'Hola Juan, tienes 0 mensajes.',
      },
      {
        invite: 'hobby as developer',
        parameters: ['hobby', { hobby: 'developer' }],
        expected: 'Elegiste desarrollador como tu pasatiempo.',
      },
      {
        invite: 'hobby as runner',
        parameters: ['hobby', { hobby: 'runner' }],
        expected: 'Elegiste corredor como tu pasatiempo.',
      },
      {
        invite: 'nested.greetings',
        parameters: [
          'nested.greetings',
          { names: ['Ana', 'Luis', 'María'] },
        ],
        expected: '¡Hola Ana, Luis y María!',
      },
      {
        invite: 'jerseyNumber',
        parameters: ['jerseyNumber', { jersey: 23.0001 }],
        expected: 'Tu número es 23.',
      },
      {
        invite: 'nested.data.lang',
        parameters: 'nested.data.lang',
        expected: 'es',
      },
      {
        invite: 'nested.data',
        parameters: 'nested.data',
        expected: { lang: 'es', langs: ['fr', 'gb', 'en'] },
      },
    ),
  );
});

describe('#05 => translation.fromMachine', () => {
  const func = translation.fromMachine<typeof machine>(
    dt => ({
      localee: 'es-ES',
      greetings: dt(
        '¡Hola {name}! Tu última conexión fue el {lastLoginDate:date}.',
        {
          date: {
            lastLoginDate: {
              month: '2-digit',
              year: 'numeric',
              day: '2-digit',
            },
          },
        },
      ),

      fdfd: '',
      inboxMessages: dt('Hola {name}, tienes {messages:plural}.', {
        plural: {
          messages: {
            one: '1 mensaje',
            other: '{?} mensajes',
            two: '2 mensajes',
          },
        },
      }),

      hobby: dt('Elegiste {hobby:enum} como tu pasatiempo.', {
        enum: {
          hobby: { runner: 'corredor', developer: 'desarrollador' },
        },
      }),

      nested: {
        greetings: dt('¡Hola {names:list}!'),
        data: { lang: 'es', langs: ['fr', 'gb', 'en'] },
        one: dt('Line {LINE} is empty', {}),
        someArray: ['cadena1', 'cadena2'],
      },

      jerseyNumber: dt('Tu número es {jersey:number}.', {
        number: {
          jersey: {},
        },
      }),
    }),
    'es-ES',
  );

  const { acceptation, success } = createTests(func as any);

  func('localee');
  describe('#00 => Acceptation', acceptation);

  describe(
    '#01 => Success',
    success(
      {
        invite: 'localee',
        parameters: 'localee',
        expected: 'es-ES',
      },
      {
        invite: 'greetings',
        parameters: [
          'greetings',
          {
            name: 'Juan',
            lastLoginDate: new Date('2024-06-15T12:00:00Z'),
          },
        ],
        expected: '¡Hola Juan! Tu última conexión fue el 15/06/2024.',
      },
      {
        invite: 'inboxMessages with one message',
        parameters: ['inboxMessages', { name: 'Juan', messages: 1 }],
        expected: 'Hola Juan, tienes 1 mensaje.',
      },
      {
        invite: 'inboxMessages with multiple messages',
        parameters: ['inboxMessages', { name: 'Juan', messages: 3 }],
        expected: 'Hola Juan, tienes 3 mensajes.',
      },
      {
        invite: 'inboxMessages with 0 messages',
        parameters: ['inboxMessages', { name: 'Juan', messages: 0 }],
        expected: 'Hola Juan, tienes 0 mensajes.',
      },
      {
        invite: 'hobby as developer',
        parameters: ['hobby', { hobby: 'developer' }],
        expected: 'Elegiste desarrollador como tu pasatiempo.',
      },
      {
        invite: 'hobby as runner',
        parameters: ['hobby', { hobby: 'runner' }],
        expected: 'Elegiste corredor como tu pasatiempo.',
      },
      {
        invite: 'nested.greetings',
        parameters: [
          'nested.greetings',
          { names: ['Ana', 'Luis', 'María'] },
        ],
        expected: '¡Hola Ana, Luis y María!',
      },
      {
        invite: 'jerseyNumber',
        parameters: ['jerseyNumber', { jersey: 23.0001 }],
        expected: 'Tu número es 23.',
      },
      {
        invite: 'nested.data.lang',
        parameters: 'nested.data.lang',
        expected: 'es',
      },
      {
        invite: 'nested.data',
        parameters: 'nested.data',
        expected: { lang: 'es', langs: ['fr', 'gb', 'en'] },
      },
    ),
  );
});
