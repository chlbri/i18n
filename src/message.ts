export class CustomMessage<S extends string = string, T = unknown> {
  constructor(
    private _translate: S,
    private _args: T,
  ) {}

  get translate() {
    return this._translate;
  }

  get args() {
    return this._args;
  }
}
