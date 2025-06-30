const arrayHasFromAsyncFunction = typeof Array.fromAsync === "function";

/**
 * Designed for Node.js 20 compatibility
 */
export async function asyncGeneratorToArray<T>(generator: AsyncGenerator<T>) {
  if (arrayHasFromAsyncFunction) return Array.fromAsync(generator);

  const array: T[] = [];

  for await (const element of generator) {
    array.push(element);
  }

  return array;
}
