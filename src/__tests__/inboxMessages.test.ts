import { createTests } from '@bemedev/vitest-extended';
import { translate } from './fixtures/translate';

describe('inboxMessages', () => {
  const inboxMessages = translate('inboxMessages', {
    name: 'John',
    messages: 1,
  }).to;

  const { acceptation, success } = createTests(inboxMessages);

  describe('#01 => Acceptation', acceptation);

  describe(
    '#02 => Success',
    success(
      {
        invite: 'without args',
        expected: 'Hello John, you have 1 message.',
      },
      {
        invite: 'en',
        parameters: 'en',
        expected: 'Hello John, you have 1 message.',
      },
      {
        invite: 'en-us, will fallback to "en", because not defs',
        parameters: 'en-us',
        expected: 'Hello John, you have 1 message.',
      },
      {
        invite: 'es',
        parameters: 'es-es',
        expected: 'Hola John, tienes 1 mensaje.',
      },
      {
        invite: 'not-exists => en',
        parameters: 'not-exists',
        expected: 'Hello John, you have 1 message.',
      },
    ),
  );
});

// Test with multiple messages
describe('inboxMessages with multiple messages', () => {
  const inboxMessages = translate('inboxMessages', {
    name: 'John',
    messages: 5,
  });

  const { acceptation, success } = createTests(inboxMessages);

  describe('#01 => Acceptation', acceptation);

  describe(
    '#02 => Success',
    success(
      {
        invite: 'without args',
        expected: 'Hello John, you have 5 messages.',
      },
      {
        invite: 'en',
        parameters: 'en',
        expected: 'Hello John, you have 5 messages.',
      },
      {
        invite: 'en-us, will fallback to "en", because not defs',
        parameters: 'en-us',
        expected: 'Hello John, you have 5 messages.',
      },
      {
        invite: 'es',
        parameters: 'es-es',
        expected: 'Hola John, tienes 5 mensajes.',
      },
      {
        invite: 'not-exists => en',
        parameters: 'not-exists',
        expected: 'Hello John, you have 5 messages.',
      },
    ),
  );
});
