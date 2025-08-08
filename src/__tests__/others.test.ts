import { createTests } from '@bemedev/vitest-extended';
import { translate } from './fixtures';

describe('Other specific tests', () => {
  describe('#01 => Nested Data Translation', () => {
    const func = translate('nested.data').to;

    const { acceptation, success } = createTests(func);

    describe('#01.01 => Acceptation', acceptation);

    describe(
      '#01.02 => Success',
      success(
        {
          invite: 'without args',
          expected: {
            lang: 'en',
            langs: expect.arrayContaining(['fr', 'gb', 'es']),
          },
        },
        {
          invite: 'en',
          parameters: 'en',
          expected: {
            lang: 'en',
            langs: expect.arrayContaining(['fr', 'gb', 'es']),
          },
        },
        {
          invite: 'en-us, will fallback to "en", because not defs',
          parameters: 'en-us',
          expected: {
            lang: 'en',
            langs: expect.arrayContaining(['fr', 'gb', 'es']),
          },
        },
        {
          invite: 'es',
          parameters: 'es-ES',
          expected: {
            lang: 'es',
            langs: expect.arrayContaining(['fr', 'gb', 'en']),
          },
        },
        {
          invite: 'not-exists => en',
          parameters: 'not-exists',
          expected: {
            lang: 'en',
            langs: expect.arrayContaining(['fr', 'gb', 'es']),
          },
        },
      ),
    );
  });

  describe('#02 => simple array', () => {
    const func = translate('nested.someArray').to;

    const { acceptation, success } = createTests(func);

    describe('#02.01 => Acceptation', acceptation);

    describe(
      '#01.02 => Success',
      success(
        {
          invite: 'without args',
          expected: expect.arrayContaining(['string1', 'string2']),
        },
        {
          invite: 'en',
          parameters: 'en',
          expected: expect.arrayContaining(['string1', 'string2']),
        },
        {
          invite: 'en-us, will fallback to "en", because not defs',
          parameters: 'en-us',
          expected: expect.arrayContaining(['string1', 'string2']),
        },
        {
          invite: 'es',
          parameters: 'es-ES',
          expected: expect.arrayContaining(['cadena1', 'cadena2']),
        },
        {
          invite: 'not-exists => en',
          parameters: 'not-exists',
          expected: expect.arrayContaining(['string1', 'string2']),
        },
      ),
    );
  });

  describe('#03 => simple array with length !== 2', () => {
    const func = translate('nested.data.langs').to;

    const { acceptation, success } = createTests(func);

    describe('#02.01 => Acceptation', acceptation);

    describe(
      '#01.02 => Success',
      success(
        {
          invite: 'without args',
          expected: expect.arrayContaining(['fr', 'gb', 'es']),
        },
        {
          invite: 'en',
          parameters: 'en',
          expected: expect.arrayContaining(['fr', 'gb', 'es']),
        },
        {
          invite: 'en-us, will fallback to "en", because not defs',
          parameters: 'en-us',
          expected: expect.arrayContaining(['fr', 'gb', 'es']),
        },
        {
          invite: 'es',
          parameters: 'es-ES',
          expected: expect.arrayContaining(['fr', 'gb', 'en']),
        },
        {
          invite: 'not-exists => en',
          parameters: 'not-exists',
          expected: expect.arrayContaining(['fr', 'gb', 'es']),
        },
      ),
    );
  });

  describe('#04 => Complex, "nested" key', () => {
    const func = translate('nested').to;

    const { acceptation, success } = createTests(func);

    describe('#04.01 => Acceptation', acceptation);

    describe(
      '#04.02 => Success',
      success(
        {
          invite: 'without args',
          expected: {
            data: {
              lang: 'en',
              langs: expect.arrayContaining(['fr', 'gb', 'es']),
            },
            someArray: expect.arrayContaining(['string1', 'string2']),
          },
        },
        {
          invite: 'en',
          parameters: 'en',
          expected: {
            data: {
              lang: 'en',
              langs: expect.arrayContaining(['fr', 'gb', 'es']),
            },
            someArray: expect.arrayContaining(['string1', 'string2']),
          },
        },
        {
          invite: 'en-us, will fallback to "en", because not defs',
          parameters: 'en-us',
          expected: {
            data: {
              lang: 'en',
              langs: expect.arrayContaining(['fr', 'gb', 'es']),
            },
            someArray: expect.arrayContaining(['string1', 'string2']),
          },
        },
        {
          invite: 'es',
          parameters: 'es-ES',
          expected: {
            data: {
              lang: 'es',
              langs: expect.arrayContaining(['fr', 'gb', 'en']),
            },
            greetings: '¡Hola {names:list}!',
            someArray: expect.arrayContaining(['cadena1', 'cadena2']),
          },
        },
        {
          invite: 'not-exists => en',
          parameters: 'not-exists',
          expected: {
            data: {
              lang: 'en',
              langs: expect.arrayContaining(['fr', 'gb', 'es']),
            },
            someArray: expect.arrayContaining(['string1', 'string2']),
          },
        },
      ),
    );
  });
});
