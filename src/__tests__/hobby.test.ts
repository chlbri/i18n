import { createTests } from '@bemedev/vitest-extended';
import { translate } from './fixtures';

describe('hobby', () => {
  describe('#01 => with runner', () => {
    const hobby = translate('hobby', {
      hobby: 'runner',
    }).to;

    const { acceptation, success } = createTests(hobby);

    describe('#01.00 => Acceptation', acceptation);

    describe(
      '#01.01 => Success',
      success(
        {
          invite: 'without args',
          expected: 'You chose runner as your hobby.',
        },
        {
          invite: 'en',
          parameters: 'en',
          expected: 'You chose runner as your hobby.',
        },
        {
          invite: 'en-us, will fallback to "en", because not defs',
          parameters: 'en-us',
          expected: 'You chose runner as your hobby.',
        },
        {
          invite: 'es',
          parameters: 'es-ES',
          expected: 'Elegiste corredor como tu pasatiempo.',
        },
        {
          invite: 'not-exists => en',
          parameters: 'not-exists',
          expected: 'You chose runner as your hobby.',
        },
      ),
    );
  });

  describe('#02 => with developer', () => {
    const hobby = translate('hobby', {
      hobby: 'developer',
    });

    const { success } = createTests(hobby);

    describe(
      '#02.01 => Success',
      success(
        {
          invite: 'without args',
          expected: 'You chose developer as your hobby.',
        },
        {
          invite: 'en',
          parameters: 'en',
          expected: 'You chose developer as your hobby.',
        },
        {
          invite: 'en-us, will fallback to "en", because not defs',
          parameters: 'en-us',
          expected: 'You chose developer as your hobby.',
        },
        {
          invite: 'es',
          parameters: 'es-ES',
          expected: 'Elegiste desarrollador como tu pasatiempo.',
        },
        {
          invite: 'not-exists => en',
          parameters: 'not-exists',
          expected: 'You chose developer as your hobby.',
        },
      ),
    );
  });
});
