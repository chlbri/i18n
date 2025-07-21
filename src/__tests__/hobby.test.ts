import { createTests } from '@bemedev/vitest-extended';
import { translate } from './fixtures/translate';

describe('hobby with runner', () => {
  const hobby = translate('hobby', {
    hobby: 'runner',
  }).to;

  const { acceptation, success } = createTests(hobby);

  describe('#01 => Acceptation', acceptation);

  describe(
    '#02 => Success',
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
        parameters: 'es-es',
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

describe('hobby with developer', () => {
  const hobby = translate('hobby', {
    hobby: 'developer',
  }).to;

  const { acceptation, success } = createTests(hobby);

  describe('#01 => Acceptation', acceptation);

  describe(
    '#02 => Success',
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
        parameters: 'es-es',
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
