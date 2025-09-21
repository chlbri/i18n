import { createTests } from '@bemedev/vitest-extended';
import { translate, translateWithLocale } from './fixtures';

describe('nested.greetings', () => {
  const args = {
    names: ['John', 'Jane', 'Bob'],
  } as any;
  const nestedGreetings = translate('nested.greetings', args).to;

  const { acceptation, success } = createTests(nestedGreetings);

  describe('#01 => Acceptation', acceptation);

  describe(
    '#02 => Success',
    success(
      {
        invite: 'without args',
        expected: 'Hello John, Jane, & Bob!',
      },
      {
        invite: 'en',
        parameters: 'en',
        expected: 'Hello John, Jane, & Bob!',
      },
      {
        invite: 'en-us, will fallback to "en", because not defs',
        parameters: 'en-us' as any,
        expected: 'Hello John, Jane, & Bob!',
      },
      {
        invite: 'es',
        parameters: 'es-ES',
        expected: '¡Hola John, Jane y Bob!',
      },
      {
        invite: 'not-exists => en',
        parameters: 'not-exists' as any,
        expected: 'Hello John, Jane, & Bob!',
      },
    ),
  );

  describe('#04 => translateWithLocale cov', () => {
    const { acceptation, success } = createTests(translateWithLocale);

    describe('#01 => Acceptation', acceptation);

    describe(
      '#02 => Success',
      success(
        {
          invite: 'en',
          parameters: ['en', { key: 'nested.greetings', args }],
          expected: 'Hello John, Jane, & Bob!',
        },
        {
          invite: 'es-ES',
          parameters: ['es-ES', { key: 'nested.greetings', args }],
          expected: '¡Hola John, Jane y Bob!',
        },
      ),
    );
  });
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
        parameters: 'en-us' as any,
        expected: 'Hello John!',
      },
      {
        invite: 'es',
        parameters: 'es-ES',
        expected: '¡Hola John!',
      },
      {
        invite: 'not-exists => en',
        parameters: 'not-exists' as any,
        expected: 'Hello John!',
      },
    ),
  );
});
