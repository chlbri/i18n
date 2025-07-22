import { createTests } from '@bemedev/vitest-extended';
import { translate } from './fixtures/translate';

describe('greetings', () => {
  const greetings = translate('greetings', {
    name: 'John',
    lastLoginDate: new Date('2023-10-01T12:00:00Z'),
  }).to;

  const { acceptation, success } = createTests(greetings);

  describe('#01 => Acceptation', acceptation);

  describe(
    '#02 => Success',
    success(
      {
        invite: 'without args',
        expected: 'Hello John! Your last login was 10/1/2023.',
      },
      {
        invite: 'en',
        parameters: 'en',
        expected: 'Hello John! Your last login was 10/1/2023.',
      },
      {
        invite: 'en-us, will fallback to "en", because not defs',
        parameters: 'en-us',
        expected: 'Hello John! Your last login was 10/1/2023.',
      },
      {
        invite: 'es',
        parameters: 'es-es',
        expected: '¡Hola John! Tu última conexión fue el 01/10/2023.',
      },
      {
        invite: 'not-exists => en',
        parameters: 'not-exists',
        expected: 'Hello John! Your last login was 10/1/2023.',
      },
    ),
  );
});
