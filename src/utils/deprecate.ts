import chalk from "chalk";

export function emitDeprecation(deprecated: string, newer?: string) {
  let message = "%s Using %s is deprecated.";
  if (newer) {
    message += " Use %s instead.";
    return console.warn(message, chalk.yellow("[warn]"), deprecated, newer);
  }
  console.warn(message, deprecated);
}
