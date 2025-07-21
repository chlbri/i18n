import { createTests } from '@bemedev/vitest-extended';
import { translate } from './fixtures/translate';

describe('nested.greetings', () => {
  const nestedGreetings = translate('nested.greetings', {
    names: ['John', 'Jane', 'Bob'],
  }).to;

  const { acceptation, success } = createTests(nestedGreetings);

  describe('#01 => Acceptation', acceptation);

  describe(
    '#02 => Success',
    success(
      {
        invite: 'without args',
        expected: 'Hello John, Jane, and Bob!',
      },
      {
        invite: 'en',
        parameters: 'en',
        expected: 'Hello John, Jane, and Bob!',
      },
      {
        invite: 'en-us, will fallback to "en", because not defs',
        parameters: 'en-us',
        expected: 'Hello John, Jane, and Bob!',
      },
      {
        invite: 'es',
        parameters: 'es-es',
        expected: '¡Hola John, Jane y Bob!',
      },
      {
        invite: 'not-exists => en',
        parameters: 'not-exists',
        expected: 'Hello John, Jane, and Bob!',
      },
    ),
  );
});

describe('nested.greetings with single name', () => {
  const nestedGreetings = translate('nested.greetings', {
    names: ['John'],
  }).to;

  const { acceptation, success } = createTests(nestedGreetings);

  describe('#01 => Acceptation', acceptation);

  describe(
    '#02 => Success',
    success(
      {
        invite: 'without args',
        expected: 'Hello John!',
      },
      {
        invite: 'en',
        parameters: 'en',
        expected: 'Hello John!',
      },
      {
        invite: 'en-us, will fallback to "en", because not defs',
        parameters: 'en-us',
        expected: 'Hello John!',
      },
      {
        invite: 'es',
        parameters: 'es-es',
        expected: '¡Hola John!',
      },
      {
        invite: 'not-exists => en',
        parameters: 'not-exists',
        expected: 'Hello John!',
      },
    ),
  );
});
