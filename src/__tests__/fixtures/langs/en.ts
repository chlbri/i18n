import { createRootTanslations } from '#i18n';

const en = createRootTanslations(dt => ({
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
}));

export default en;
