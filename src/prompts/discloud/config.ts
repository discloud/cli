import { APTPackages } from "@discloudapp/api-types/v2";
import { existsSync } from "fs";
import { readdir, stat } from "fs/promises";
import inquirer from "inquirer";
import { dirname, join } from "path";

function getAnswer<T extends { answer: any }>(value: T) {
  return value.answer;
}

async function promptTrier<R extends { answer: any }>(fn: () => Promise<R>) {
  try {
    return await fn().then(getAnswer);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "ExitPromptError")
        throw new Error("Cancelled");
    }

    throw error;
  }
}

export function promptAppApt(): Promise<string[]> {
  return promptTrier(() => inquirer.prompt([{
    type: "checkbox",
    name: "answer",
    message: "Select APTs for your app",
    choices: APTPackages,
  }]));
}

export function promptAppAutoRestart(): Promise<boolean> {
  return promptTrier(() => inquirer.prompt([{
    type: "confirm",
    name: "answer",
    message: "Auto restart?",
    default: false,
  }]));
}

export function promptAppMain(): Promise<string> {
  return promptTrier(() => inquirer.prompt([{
    type: "search",
    name: "answer",
    message: "Input the main file path of your app",
    async source(term, _opt) {
      if (term) term = term.replace(/[\\]/g, "/");

      const dir = join(typeof term === "string" ? existsSync(term) ? term : dirname(term) : "");

      const files = await readdir(dir);

      for (let i = 0; i < files.length;) {
        files[i] = join(dir, files[i]).replace(/[\\]/g, "/");

        if (term ? files[i].startsWith(term) : true) {
          i++;
          continue;
        }

        files.splice(i, 1);
      }

      return files;
    },
    async validate(value) {
      if (typeof value === "string" && existsSync(value)) {
        const fileStat = await stat(value);
        if (fileStat.isFile()) return true;
      }
      return false;
    },
  }]));
}

export function promptAppRam(min?: number, max?: number): Promise<number> {
  return promptTrier(() => inquirer.prompt({
    type: "number",
    name: "answer",
    message: "Input the amount of RAM for your app",
    min,
    max,
    required: true,
    default: min,
  }));
}

export function promptAppType(type?: string): Promise<string> {
  return promptTrier(() => inquirer.prompt([{
    type: "list",
    name: "answer",
    message: "Input the type of your app",
    choices: ["bot", "site"],
    default: type,
  }]));
}

export function promptAppVersion(): Promise<string> {
  return promptTrier(() => inquirer.prompt([{
    type: "list",
    name: "answer",
    message: "Input the engine version of your app",
    choices: ["latest", "current", "suja"],
    default: "latest",
  }]));
}
