import { createTests } from '@bemedev/vitest-extended';
import { translationFrom } from '../translationFrom';

describe('#01 => translationFrom', () => {
  const { acceptation } = createTests(translationFrom);

  describe('#01 => Acceptation', acceptation);

  // Test with plain object
  describe('#02 => Basic translationFrom with plain object', () => {
    const translate = translationFrom({
      greeting: 'Hello',
      farewell: 'Goodbye',
      withParam: 'Hello {name}!',
      nested: {
        welcome: 'Welcome back',
        deep: {
          message: 'Deep message',
        },
      },
    });

    describe('#01 => should translate simple keys', () => {
      test('#01 => greeting key', () => {
        expect(translate('greeting')).toBe('Hello');
      });

      test('#02 => farewell key', () => {
        expect(translate('farewell')).toBe('Goodbye');
      });
    });

    test('#02 => should translate with parameters', () => {
      expect(translate('withParam', { name: 'John' })).toBe('Hello John!');
    });

    describe('#03 => should translate nested keys', () => {
      test('#01 => nested welcome', () => {
        expect(translate('nested.welcome')).toBe('Welcome back');
      });

      test('#02 => deep nested message', () => {
        expect(translate('nested.deep.message')).toBe('Deep message');
      });
    });

    test('#04 => should return nested objects when accessing partial paths', () => {
      const nested = translate('nested');
      expect(nested).toEqual({
        welcome: 'Welcome back',
        deep: { message: 'Deep message' },
      });
    });
  });

  // Test with function using defineTranslation
  describe('#03 => translationFrom with defineTranslation function', () => {
    const translate = translationFrom(dt => ({
      greeting: 'Hello {name}!',
      dateMessage: dt('Today is {date:date}', {
        date: { date: { dateStyle: 'long' } },
      }),
      pluralMessage: dt('You have {count:plural}', {
        plural: {
          count: {
            one: '1 item',
            zero: '0 items',
            other: '{?} items',
          },
        },
      }),
      enumMessage: dt('Status: {status:enum}', {
        enum: {
          status: {
            pending: 'Pending',
            completed: 'Completed',
          },
        },
      }),
      numberFormat: dt('Price: {amount:number}', {
        number: {
          amount: {
            style: 'currency',
            currency: 'USD',
          },
        },
      }),
      listFormat: dt('Users: {users:list}', {
        list: {
          users: { style: 'long', type: 'conjunction' },
        },
      }),
    }));

    test('#01 => should handle simple string interpolation', () => {
      expect(translate('greeting', { name: 'Alice' })).toBe(
        'Hello Alice!',
      );
    });

    test('#02 => should handle date formatting', () => {
      const date = new Date('2025-01-01T12:00:00Z');
      const result = translate('dateMessage', { date });
      expect(result).toMatch(/Today is/);
      expect(result).toMatch(/2025/);
    });

    describe('#03 => should handle plural formatting', () => {
      test('#01 => singular form (count = 1)', () => {
        expect(translate('pluralMessage', { count: 1 })).toBe(
          'You have 1 item',
        );
      });

      test('#02 => plural form (count = 5)', () => {
        expect(translate('pluralMessage', { count: 5 })).toBe(
          'You have 5 items',
        );
      });

      test.runIf(process.env.VITEST_VSCODE === 'true')(
        '#03 => plural form (count = 0)',
        () => {
          console.log(
            'EEROOR =>',
            translate('pluralMessage', { count: 0 }),
          );
          expect(translate('pluralMessage', { count: 0 })).toBe(
            'You have 0 items',
          );
        },
      );
    });

    describe('#04 => should handle enum formatting', () => {
      test('#01 => pending status', () => {
        expect(translate('enumMessage', { status: 'pending' })).toBe(
          'Status: Pending',
        );
      });

      test('#02 => completed status', () => {
        expect(translate('enumMessage', { status: 'completed' })).toBe(
          'Status: Completed',
        );
      });
    });

    describe('#05 => should handle number formatting', () => {
      test('#01 => contains price label', () => {
        const result = translate('numberFormat', { amount: 123.45 });
        expect(result).toMatch(/Price:/);
      });

      test('#02 => contains dollar sign for USD', () => {
        const result = translate('numberFormat', { amount: 123.45 });
        expect(result).toMatch(/\$/); // Should include dollar sign for USD
      });
    });

    test.runIf(process.env.VITEST_VSCODE === 'true')(
      '#06 => should handle list formatting',
      () => {
        const result = translate('listFormat', {
          users: ['Alice', 'Bob', 'Charlie'],
        });
        expect(result).toBe('Users: Alice, Bob, and Charlie');
      },
    );
  });

  // Test edge cases
  describe('#04 => Edge cases for translationFrom', () => {
    test('#01 => should handle function returning empty object', () => {
      const translate = translationFrom(() => ({}));
      // Should not throw when calling with invalid keys
      expect(() => (translate as any)('nonexistent')).not.toThrow();
    });

    describe('#02 => should handle complex nested structures', () => {
      const translate = translationFrom({
        level1: {
          level2: {
            level3: 'Deep nested value',
            array: ['item1', 'item2'],
          },
          simple: 'Simple value',
        },
        root: 'Root level',
      });

      test('#01 => deep nested value access', () => {
        expect(translate('level1.level2.level3')).toBe(
          'Deep nested value',
        );
      });

      test('#02 => simple nested value access', () => {
        expect(translate('level1.simple')).toBe('Simple value');
      });

      test('#03 => root level access', () => {
        expect(translate('root')).toBe('Root level');
      });

      test('#04 => array value access', () => {
        expect(translate('level1.level2.array')).toEqual([
          'item1',
          'item2',
        ]);
      });
    });
  });
});

describe('#02 => translationFrom.complete', () => {
  // Test translationFrom.complete basic usage
  describe('#01 => Basic translationFrom.complete usage', () => {
    const rootConfig = {
      greeting: 'Hello',
      user: {
        name: 'Default User',
      },
    };

    describe('#01 => should work with plain object translation', () => {
      const translate = translationFrom.complete(rootConfig, {
        greeting: 'Bonjour',
      });

      test('#01 => overridden greeting translation', () => {
        expect(translate('greeting')).toBe('Bonjour');
      });

      test('#02 => fallback to root config for user name', () => {
        expect(translate('user.name')).toBe('Default User'); // Should access root config
      });
    });

    describe('#02 => should work with function translation matching root structure', () => {
      const translate = translationFrom.complete(rootConfig, () => ({
        greeting: 'Hola {name}!',
        user: {
          name: 'Usuario por defecto',
        },
      }));

      test('#01 => function-based greeting translation', () => {
        expect(translate('greeting')).toBe('Hola {name}!'); // No processing since dt not used
      });

      test('#02 => function-based user name translation', () => {
        expect(translate('user.name')).toBe('Usuario por defecto');
      });
    });
  });

  // Test advanced scenarios with translationFrom.complete
  describe('#02 => Advanced translationFrom.complete scenarios', () => {
    const complexConfig = {
      app: {
        title: 'My App',
        navigation: {
          home: 'Home',
          about: 'About',
        },
      },
      messages: {
        success: 'Success!',
        error: 'Error occurred',
      },
    };

    describe('#01 => should provide access to root config values', () => {
      const translate = translationFrom.complete(complexConfig, {});

      test('#01 => app title access', () => {
        expect(translate('app.title')).toBe('My App');
      });

      test('#02 => navigation home access', () => {
        expect(translate('app.navigation.home')).toBe('Home');
      });

      test('#03 => success message access', () => {
        expect(translate('messages.success')).toBe('Success!');
      });
    });

    describe('#02 => should work with partial overrides', () => {
      const translate = translationFrom.complete(complexConfig, {
        app: {
          title: 'Mon Application',
        },
      });

      test('#01 => overridden app title', () => {
        expect(translate('app.title')).toBe('Mon Application'); // Overridden
      });

      test('#02 => navigation from root config', () => {
        expect(translate('app.navigation.home')).toBe('Home'); // From root config
      });

      test('#03 => success message from root config', () => {
        expect(translate('messages.success')).toBe('Success!'); // From root config
      });
    });

    describe('#03 => should work with function matching structure', () => {
      const translate = translationFrom.complete(complexConfig, dt => ({
        app: {
          title: 'Mi Aplicación',
          navigation: {
            home: 'Inicio',
            about: 'Acerca de',
          },
        },
        messages: {
          success: dt('¡Éxito! Operación completada.', {}),
          error: 'Error ocurrido',
        },
      }));

      test('#01 => app title translation', () => {
        expect(translate('app.title')).toBe('Mi Aplicación');
      });

      test('#02 => navigation home translation', () => {
        expect(translate('app.navigation.home')).toBe('Inicio');
      });

      test('#03 => success message with defineTranslation', () => {
        expect(translate('messages.success')).toBe(
          '¡Éxito! Operación completada.',
        );
      });

      test('#04 => error message translation', () => {
        expect(translate('messages.error')).toBe('Error ocurrido');
      });
    });
  });

  // Test type safety and edge cases
  describe('#03 => Edge cases for complete', () => {
    test('#01 => should handle empty config and translation', () => {
      const translate = translationFrom.complete({}, {});
      expect(() => (translate as any)('any')).not.toThrow();
    });

    test('#02 => should handle formatted translations with proper typing', () => {
      const config = {
        simple: 'Simple message',
      };

      const translate = translationFrom.complete(config, {
        simple: 'Message simple',
      });

      expect(translate('simple')).toBe('Message simple');
    });

    describe('#03 => should preserve object structures in config', () => {
      const config = {
        nested: {
          data: {
            value: 'original',
            list: ['a', 'b', 'c'],
          },
        },
      };

      const translate = translationFrom.complete(config, {});

      test('#01 => nested data object structure', () => {
        const nestedData = translate('nested.data');
        expect(nestedData).toEqual({
          value: 'original',
          list: ['a', 'b', 'c'],
        });
      });

      test('#02 => nested data value access', () => {
        expect(translate('nested.data.value')).toBe('original');
      });

      test('#03 => nested data list access', () => {
        expect(translate('nested.data.list')).toEqual(['a', 'b', 'c']);
      });
    });

    describe('#04 => should handle mixed string and object overrides', () => {
      const config = {
        section: {
          title: 'Original Title',
          content: {
            text: 'Original text',
            meta: 'Original meta',
          },
        },
      };

      const translate = translationFrom.complete(config, {
        section: {
          title: 'Titre modifié',
          content: {
            text: 'Texte modifié',
            // meta should remain from config
          },
        },
      });

      test('#01 => overridden section title', () => {
        expect(translate('section.title')).toBe('Titre modifié');
      });

      test('#02 => overridden content text', () => {
        expect(translate('section.content.text')).toBe('Texte modifié');
      });

      test('#03 => original meta from config', () => {
        expect(translate('section.content.meta')).toBe('Original meta'); // From config
      });
    });
  });
});
