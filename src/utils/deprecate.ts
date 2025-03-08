export function emitDeprecation(deprecated: string, newer?: string) {
  let message = `Using ${deprecated} is deprecated.`;
  if (newer) message += ` use ${newer} instead`;
  process.emitWarning(message);
}
