import { createTests } from '@bemedev/dev-utils/vitest-extended';
import { translate } from './fixtures';

describe('Other specific tests', () => {
  describe('#01 => Nested One Translation (flat key)', () => {
    const func = translate('nested.one', { LINE: '10' }).to;

    const { acceptation, success } = createTests(func);

    describe('#01.01 => Acceptation', acceptation);

    describe(
      '#01.02 => Success',
      success(
        {
          invite: 'without args',
          expected: 'Line 10 is empty',
        },
        {
          invite: 'en',
          parameters: 'en',
          expected: 'Line 10 is empty',
        },
        {
          invite: 'en-us, will fallback to "en", because not defs',
          parameters: 'en-us' as any,
          expected: 'Line 10 is empty',
        },
        {
          invite: 'es',
          parameters: 'es-ES',
          expected: 'La línea 10 está vacía',
        },
        {
          invite: 'not-exists => en',
          parameters: 'not-exists' as any,
          expected: 'Line 10 is empty',
        },
      ),
    );
  });
});
