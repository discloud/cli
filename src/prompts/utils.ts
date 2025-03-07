import PromptError from "../errors/prompt";

function getAnswer<T extends { answer: any }>(value: T) {
  return value.answer;
}

export async function promptTrier<R extends { answer: any }>(fn: () => Promise<R>) {
  try {
    return await fn().then(getAnswer);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "ExitPromptError")
        throw new PromptError("Cancelled");
    }

    throw error;
  }
}
