import type en from './fixtures/langs/en';

declare module '../index' {
  interface Register {
    translations: typeof en;
  }
}
