export default class MissingRequiredOptionError extends Error {
  readonly name = "MissingRequiredOption";

  constructor(
    readonly option: string,
  ) {
    super(`Missing required option: ${option}`);
  }
}
