import { dt, type LanguageMessages } from '#i18n';

const en = {
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
    greetings: 'Hello {names:list}!',
  },
} as const satisfies LanguageMessages;

export default en;
