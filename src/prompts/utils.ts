import { type Dirent } from "fs";
import PromptError from "../errors/prompt";

export async function promptTrier<R>(fn: () => Promise<R>) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error && error.name === "ExitPromptError")
      throw new PromptError("Cancelled");

    throw error;
  }
}

const localeOptions: Intl.CollatorOptions = { sensitivity: "accent" };

export function filesSort(a: Dirent<string>, b: Dirent<string>): number {
  return a.name.localeCompare(b.name, undefined, localeOptions) +
    (a.isDirectory() ? -2 : 2) + (b.isDirectory() ? 2 : -2);
}
