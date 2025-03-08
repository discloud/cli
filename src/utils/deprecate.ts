export function emitDeprecation(deprecated: string, newer?: string) {
  let message = "[warn] Using %s is deprecated.";
  if (newer) message += " Use %s instead.";
  console.warn(message, deprecated, newer);
}
