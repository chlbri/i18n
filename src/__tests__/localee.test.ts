import { createTests } from '@bemedev/vitest-extended';
import { translate, translateWithLocale } from './fixtures';

describe('localee', () => {
  const localee = translate('localee').to;

  const { acceptation, success } = createTests(localee);

  describe('#01 => Acceptation', acceptation);

  describe(
    '#02 => Success',
    success(
      {
        invite: 'without args',
        expected: 'en',
      },
      {
        invite: 'en',
        parameters: 'en',
        expected: 'en',
      },
      {
        invite: 'en-us',
        parameters: 'en-US',
        expected: 'en-US',
      },
      {
        invite: 'es',
        parameters: 'es-ES',
        expected: 'es-ES',
      },
      {
        invite: 'not-exists => en',
        parameters: 'not-exists' as any,
        expected: 'en',
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
          parameters: ['en', 'localee'],
          expected: 'en',
        },
        {
          invite: 'en-us',
          parameters: ['en-US', 'localee'],
          expected: 'en-US',
        },
        {
          invite: 'es-ES',
          parameters: ['es-ES', 'localee'],
          expected: 'es-ES',
        },
      ),
    );
  });
});
