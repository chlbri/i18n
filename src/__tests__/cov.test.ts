import { create } from '../class';
import { createConfig } from '../helpers';
import { machine } from './fixtures';

describe('Coverage', () => {
  test('#01 => Empty machine', () => {
    const { translations } = create({}, 'en');
    expect(translations).toEqual({ en: {} });
  });

  test('#02 => Single key', () => {
    const { translations } = create({ hello: 'Hello' }, 'en');
    expect(translations).toEqual({ en: { hello: 'Hello' } });
  });

  describe('#03 => Single key, multiples fallbacks', () => {
    const _config = createConfig({ hello: 'Hello' });
    const { translations, keys, config } = create(
      _config,
      'en',
      'en-US',
      'fr-FR',
    );

    test('#03.01 => translations', () => {
      expect(translations).toEqual({
        en: _config,
        'en-US': _config,
        'fr-FR': _config,
      });
    });

    test('#03.02 => keys', () => {
      const expected = ['en', 'en-US', 'fr-FR'];
      expect(keys).toEqual(expect.arrayContaining(expected));
      expect(expected).toEqual(expect.arrayContaining(keys));
    });

    test('#03.03 => config', () => {
      expect(config).toEqual(_config);
    });
  });

  describe('#04 => Config', () => {
    const config = createConfig(dt => ({
      localee: 'en',
      greetings: 'Hello {name}! Your last login was {lastLoginDate:date}.',
      inboxMessages: dt('Hello {name}, you have {messages:plural}.', {
        plural: {
          messages: { one: '1 message', other: '{?} messages' },
        },
      }),
    }));

    test('#04.01 => Localee is string', () => {
      expect(config.localee).toEqual('en');
    });

    test('#04.02 => Greetings is string', () => {
      expect(config.greetings).toEqual(
        'Hello {name}! Your last login was {lastLoginDate:date}.',
      );
    });

    test('#04.03 => InboxMessages is function', () => {
      const expected = [
        'Hello {name}, you have {messages:plural}.',
        {
          plural: {
            messages: {
              one: '1 message',
              other: '{?} messages',
            },
          },
        },
      ];

      expect(config.inboxMessages).toStrictEqual(expected);
    });
  });

  describe('#05 => typings', () => {
    test('#05.01 => __key', () => {
      const key = machine.__key;
      expect(key).toBeUndefined();
    });

    test('#05.02 => __translation', () => {
      const translation = machine.__translation;
      expect(translation).toBeUndefined();
    });
  });
});
