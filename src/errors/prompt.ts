export default class PromptError extends Error {
  readonly name = "Prompt";

  constructor(
    message?: string,
  ) {
    super(message);
  }
}
