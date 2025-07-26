export function normalizeGlobPattern(pattern: string | string[]) {
  if (!Array.isArray(pattern)) return [pattern, `${pattern}/**`];

  return pattern.flatMap((pattern) => [pattern, `${pattern}/**`]);
}
