const arrayHasFromAsyncFunction = typeof Array.fromAsync === "function";

export async function asyncGeneratorToArray(generator) {
  if (arrayHasFromAsyncFunction) return Array.fromAsync(generator);

  const array = [];

  for await (const element of generator) {
    array.push(element);
  }

  return array;
}
