import { createTranslations } from '#i18n';

const esES = createTranslations(dt => ({
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
    enum: { hobby: { runner: 'corredor', developer: 'desarrollador' } },
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
}));

//cadena1
export default esES;
