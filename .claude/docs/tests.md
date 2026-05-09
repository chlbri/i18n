# Test Files Overview

All test files live in [src/**tests**/](../../src/__tests__/).

---

## [cov.test.ts](../../src/__tests__/cov.test.ts) — Coverage / Core API

Tests the `create` factory directly for edge cases and type safety:

- **#01** Empty machine → `translations` is `{ en: {} }`
- **#02** Single key → stored under the default locale
- **#03** Single config with multiple fallback locales (`en`, `en-US`,
  `fr-FR`) → checks `translations`, `keys`, and `config` shape
- **#04** `createConfig` with a function (plain string key + `dt(...)` rich
  key) → verifies the resulting config values
- **#05** Type-only fields: `__key` and `__translation` are `undefined` at
  runtime

---

## [greetings.test.ts](../../src/__tests__/greetings.test.ts) — String + Date Interpolation

Translates the `greetings` key with `{ name, lastLoginDate }`. Verifies:

- Default locale (`en`) → `"Hello John! Your last login was 10/1/2023."`
- `en-us` / `en-US` (no explicit definition) falls back to `en`
- `es-ES` → `"¡Hola John! Tu última conexión fue el 01/10/2023."`
  (locale-aware date formatting)
- Unknown locale → falls back to `en`

---

## [hobby.test.ts](../../src/__tests__/hobby.test.ts) — Enum Interpolation

Translates the `hobby` key with an enum-typed `{hobby}` param. Two
sub-suites:

- **runner**: English `"You chose runner as your hobby."` / Spanish
  `"Elegiste corredor como tu pasatiempo."`
- **developer**: same pattern, mapped enum value `"desarrollador"`

---

## [jerseyNumber.test.ts](../../src/__tests__/jerseyNumber.test.ts) — Number Formatting

Translates `jerseyNumber` with `{ jersey: 23.0001 }`:

- `en` / `en-US` → `"Your number is 23.00."` (2 decimal places)
- `es-ES` → `"Tu número es 23."` (no decimals per Spanish locale rules)
- Unknown locale → falls back to `en`

---

## [localee.test.ts](../../src/__tests__/localee.test.ts) — Locale Key + `translateWithLocale`

Two areas:

- **`localee` key**: translating returns the locale string itself (`"en"`,
  `"en-US"`, `"es-ES"`)
- **`translateWithLocale`**: a lower-level function that takes
  `(locale, key)` directly — verifies the same locale-return behavior via a
  different API surface

---

## [messages.test.ts](../../src/__tests__/messages.test.ts) — Plural Formatting

Translates `inboxMessages` with `{ name, messages: N }` across four count
variants:

- **1 message** → `"Hello John, you have 1 message."` /
  `"Hola John, tienes 1 mensaje."`
- **5 messages** → plural form with count substitution
- **2 messages** → plural (uses `other` rule in English)
- **0 messages** → plural fallback

---

## [nestedGreetings.test.ts](../../src/__tests__/nestedGreetings.test.ts) — List Interpolation + Nested Keys

Translates `nested.greetings` with `{ names: string[] }` (list format):

- Multiple names (`["John", "Jane", "Bob"]`) → `"Hello John, Jane, & Bob!"`
  / `"¡Hola John, Jane y Bob!"` (locale-specific list separator)
- Single name (`["John"]`) → `"Hello John!"` / `"¡Hola John!"` (no list
  separator)
- Also tests `translateWithLocale` with the nested key path

---

## [others.test.ts](../../src/__tests__/others.test.ts) — Nested Objects, Arrays, and Partial Key Access

Four sub-suites for non-string translation values:

- **#01 `nested.data`**: translates to an object `{ lang, langs }` —
  locale-aware object translation
- **#02 `nested.someArray`**: translates to a `string[]`
  (`["string1","string2"]` / `["cadena1","cadena2"]`)
- **#03 `nested.data.langs`**: array with 3+ items (different code path
  than length-2 arrays)
- **#04 `nested`** (whole namespace): translates the entire `nested`
  subtree at once, merging args for sub-keys (`nested.one`,
  `nested.greetings`)

---

## [translation.test.ts](../../src/__tests__/translation.test.ts) — `translation` Low-Level API

The most comprehensive file, testing the `translation` function and its
static methods:

- **#01** Plain object config: simple key lookup, parameter interpolation,
  nested dot-path access, partial path returning an object
- **#02** Function-based config with `dt(...)`: date, plural (0/1/many),
  enum, number (currency), list formatting
- **#03** Edge cases: empty config, deeply nested structures, array values
- **#02–#05** `translation.derived` and `translation.fromMachine`:
  verifying that a derived (Spanish) translation set correctly resolves all
  key types — greetings (date), inbox (plural), hobby (enum), nested list,
  number format, and full object/deep path access
