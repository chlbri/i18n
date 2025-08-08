import { create } from '../class';

export const machine = create(
  dt => ({
    localee: 'en',
    greetings: 'Hello {name}! Your last login was {lastLoginDate:date}.',
    inboxMessages: dt('Hello {name}, you have {messages:plural}.', {
      plural: {
        messages: { one: '1 message', other: '{?} messages' },
      },
    }),
    hobby: dt('You chose {hobby:enum} as your hobby.', {
      enum: { hobby: { runner: 'runner', developer: 'developer' } },
    }),
    nested: {
      greetings: dt('Hello {names:list}!', {
        list: { names: { style: 'short' } },
      }),
      data: { lang: 'en', langs: ['fr', 'gb', 'es'] },
      someArray: ['string1', 'string2'],
      one: dt('Line {LINE} is empty', {}),
    },

    jerseyNumber: dt('Your number is {jersey:number}.', {
      number: {
        jersey: {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      },
    }),
  }),
  'en',
)
  .provideTranslation('es-ES', dt => ({
    localee: 'es-ES',

    greetings: dt(
      '¡Hola {name}! Tu última conexión fue el {lastLoginDate:date}.',
      {
        date: {
          lastLoginDate: {
            month: '2-digit',
            year: 'numeric',
            day: '2-digit',
          },
        },
      },
    ),

    fdfd: '',
    inboxMessages: dt('Hola {name}, tienes {messages:plural}.', {
      plural: {
        messages: {
          one: '1 mensaje',
          other: '{?} mensajes',
          two: '2 mensajes',
        },
      },
    }),

    hobby: dt('Elegiste {hobby:enum} como tu pasatiempo.', {
      enum: {
        hobby: { runner: 'corredor', developer: 'desarrollador' },
      },
    }),

    nested: {
      greetings: '¡Hola {names:list}!',
      data: { lang: 'es', langs: ['fr', 'gb', 'en'] },
      one: dt('Line {LINE} is empty', {}),
      someArray: ['cadena1', 'cadena2'],
    },

    jerseyNumber: dt('Tu número es {jersey:number}.', {
      number: {
        jersey: {},
      },
    }),
  }))
  .provideTranslation('en-US', {
    localee: 'en-US',
  });

export const translate = machine.translate;
export const translateWithLocale = machine.translateWithLocale;
