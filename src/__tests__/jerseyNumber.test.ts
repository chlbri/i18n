import { createTests } from '@bemedev/vitest-extended';
import { translate } from './fixtures';

describe('jerseyNumber', () => {
  const jerseyNumber = translate('jerseyNumber', {
    jersey: 23.0001,
  }).to;

  const { acceptation, success } = createTests(jerseyNumber);

  describe('#01 => Acceptation', acceptation);

  describe(
    '#02 => Success',
    success(
      {
        invite: 'without args',
        expected: 'Your number is 23.00.',
      },
      {
        invite: 'en',
        parameters: 'en',
        expected: 'Your number is 23.00.',
      },
      {
        invite: 'en-us',
        parameters: 'en-us',
        expected: 'Your number is 23.00.',
      },
      {
        invite: 'es-ES',
        parameters: 'es-ES',
        expected: 'Tu número es 23.',
      },
      {
        invite: 'not-exists => en',
        parameters: 'not-exists',
        expected: 'Your number is 23.00.',
      },
    ),
  );
});
