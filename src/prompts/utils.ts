import PromptError from "../errors/prompt";

export async function promptTrier<R>(fn: () => Promise<R>) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "ExitPromptError")
        throw new PromptError("Cancelled");
    }

    throw error;
  }
}
