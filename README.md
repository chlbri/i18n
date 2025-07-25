# @bemedev/i18n

An elegant and typed internationalization library for JavaScript and
TypeScript projects. This library provides a simple yet powerful way to
handle translations and locale-specific content.

## Features

- ✅ Fully typed API with TypeScript
- ✅ Formatting support for dates, numbers, lists and more
- ✅ Elegant plural handling
- ✅ Typed enum support
- ✅ Nested translation structure
- ✅ Automatic fallback to default language

<br/>

## Installation

```bash
# npm
npm install @bemedev/i18n

# yarn
yarn add @bemedev/i18n

# pnpm
pnpm add @bemedev/i18n
```

## Complete Usage Guide

### Basic Setup

To start using `@bemedev/i18n`, first initialize the library with your
translations:

```typescript
import { initI18n } from '@bemedev/i18n';

// Define your translations
const en = {
  greetings: 'Hello {name}!',
  dashboard: {
    welcome: 'Welcome to your dashboard',
    stats: 'You have {count} notifications',
  },
};

const fr = {
  greetings: 'Bonjour {name} !',
  dashboard: {
    welcome: 'Bienvenue sur votre tableau de bord',
    stats: 'Vous avez {count} notifications',
  },
};

// Initialize with your translations and set English as the default language
const { translate } = initI18n({ en, fr }, 'en');
```

### Simple Usage

```typescript
// Translation without parameters
const welcome = translate('dashboard.welcome')(); // "Welcome to your dashboard"

// Translation with parameters
const greeting = translate('greetings', { name: 'John' })(); // "Hello John!"

// Translation with language change
const greetingFr = translate('greetings', { name: 'John' }).to('fr'); // "Bonjour John !"
```

### Advanced Features

#### Date Formatting

```typescript
import { dt } from '@bemedev/i18n';

const messages = {
  lastSeen: dt('Last seen: {date:date}', {
    date: {
      date: { dateStyle: 'full' },
    },
  }),
};

// Usage
translate('lastSeen', { date: new Date() })();
// "Last seen: Wednesday, July 21, 2025"
```

#### Plural Handling

```typescript
const messages = {
  items: dt('You have {count:plural} in your cart', {
    plural: {
      count: {
        one: '{?} item',
        other: '{?} items',
      },
    },
  }),
};

// Usage
translate('items', { count: 1 })(); // "You have 1 item in your cart"
translate('items', { count: 5 })(); // "You have 5 items in your cart"
```

#### Typed Enums

```typescript
const messages = {
  status: dt('Your order status is {status:enum}', {
    enum: {
      status: {
        pending: 'awaiting processing',
        shipped: 'on its way',
        delivered: 'delivered',
      },
    },
  }),
};

// Usage
translate('status', { status: 'pending' })(); // "Your order status is awaiting processing"
```

#### Formatted Lists

```typescript
const messages = {
  friends: dt('Online: {users:list}', {
    list: {
      users: { style: 'long', type: 'conjunction' },
    },
  }),
};

// Usage
translate('friends', { users: ['Alice', 'Bob', 'Charlie'] })();
// "Online: Alice, Bob, and Charlie"
```

### Strong Typing with TypeScript

#### Extending the Register Interface

The library uses a `Register` interface to ensure strong typing for your
translations. To fully leverage TypeScript's type system, extend this
interface with your own translation types:

1. Create a type definition file for your translations:

```typescript
// translations.ts
export const en = {
  greetings: 'Hello {name}!',
  dashboard: {
    welcome: 'Welcome to your dashboard',
    stats: 'You have {count} notifications',
  },
};

export type Translations = typeof en;
```

2. Extend the `Register` interface in a declaration file:

```typescript
// types.d.ts or similar
import type { Translations } from './translations';

declare module '@bemedev/i18n' {
  interface Register {
    translations: Translations;
  }
}
```

Once configured, you'll benefit from full autocompletion and type checking:

```typescript
// Autocompletion for translation keys
translate('dashboard.welcome')();

// TypeScript error if the key does not exist
translate('dashboard.nonexistent')(); // ❌ Error

// Parameter validation
translate('greetings', { name: 'John' })(); // ✅ OK
translate('greetings')(); // ❌ Error: missing 'name' parameter
```

## Advanced Examples

### Language Fallbacks

```typescript
// Define multiple fallback languages
const { translate } = initI18n({ en, fr, 'en-US', 'en-GB' }, 'en', 'en-US');

// If a translation is not available in 'en-GB',
// it will be searched in 'en-US', then in 'en'
```

### Nested Translation Structure

```typescript
const translations = {
  en: {
    app: {
      nav: {
        home: 'Home',
        settings: 'Settings',
        profile: {
          edit: 'Edit Profile',
          view: 'View Profile',
        },
      },
    },
  },
};

##

// Access with dot notation
translate('app.nav.profile.edit')(); // "Edit Profile"
```

## Licence

MIT

## CHANGE_LOG

<details>

<summary>
...
</summary>

[CHANGELOG](https://github.com/chlbri/i18n/blob/main/CHANGE_LOG.md)

</details>

<br/>

## Auteur

chlbri (bri_lvi@icloud.com)

<br/>

## Inspired by

[Web Dev Simplified](https://www.youtube.com/@WebDevSimplified)

The Youtube video that inspired this library can be found
[here](https://www.youtube.com/watch?v=VbZVx13b2oY).

[My github](https://github.com/chlbri?tab=repositories)

[<svg width="98" height="96" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f"/></svg>](https://github.com/chlbri?tab=repositories)

<br/>

## Liens

- [Documentation](https://github.com/chlbri/i18n)
- [Signaler un problème](https://github.com/chlbri/i18n/issues)
