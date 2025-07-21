import { dt, type Translations } from '#i18n';

const esES = {
  localee: 'es-ES',
  greetings:
    '¡Hola {name}! Tu última conexión fue el {lastLoginDate:date}.',
  inboxMessages: dt('Hola {name}, tienes {messages:plural}.', {
    plural: { messages: { one: '1 mensaje', other: '{?} mensajes' } },
  }),
  hobby: dt('Elegiste {hobby:enum} como tu pasatiempo.', {
    enum: { hobby: { runner: 'corredor', developer: 'desarrollador' } },
  }),
  nested: {
    greetings: '¡Hola {names:list}!',
  },
} as const satisfies Translations;

export default esES;
