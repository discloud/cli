export default class StoreError extends Error {
  readonly name = "Store";

  constructor(
    message?: string,
  ) {
    super(message);
  }
}