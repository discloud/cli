import { APTPackages } from "@discloudapp/api-types/v2";
import { checkbox, confirm, number, search, select } from "@inquirer/prompts";
import { existsSync } from "fs";
import { readdir, stat } from "fs/promises";
import { dirname, join } from "path";
import { promptTrier } from "../utils";

export function promptAppApt(): Promise<string[]> {
  return promptTrier(() => checkbox({
    message: "Select APTs for your app",
    choices: APTPackages,
  }));
}

export function promptAppAutoRestart(): Promise<boolean> {
  return promptTrier(() => confirm({
    message: "Auto restart?",
    default: false,
  }));
}

export function promptAppMain(): Promise<string> {
  return promptTrier(() => search({
    message: "Input the main file path of your app",
    async source(term, _opt) {
      if (term) term = term.replace(/[\\]/g, "/");

      const dir = join(typeof term === "string" ? existsSync(term) ? term : dirname(term) : ".");

      const files = await readdir(dir, { withFileTypes: true });

      files.sort((a, b) => a.name.localeCompare(b.name) + (a.isDirectory() ? -2 : 2) + (b.isDirectory() ? 2 : -2));

      const result: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const filename = join(dir, files[i].name).replace(/[\\]/g, "/");

        if (term ? filename.includes(term) : true) {
          result.push(filename);
          continue;
        }
      }

      if (term) result.sort((a, b) => (a.startsWith(term) ? -1 : 1) + (b.startsWith(term) ? 1 : -1));

      return result;
    },
    async validate(value) {
      if (typeof value === "string" && existsSync(value)) {
        const fileStat = await stat(value);
        if (fileStat.isFile()) return true;
      }
      return false;
    },
  }));
}

export function promptAppRam(min?: number, max?: number): Promise<number> {
  return promptTrier(() => number({
    message: "Input the amount of RAM for your app",
    min,
    max,
    required: true,
    default: min,
  }) as Promise<number>);
}

export function promptAppType(type?: string): Promise<string> {
  return promptTrier(() => select({
    message: "Input the type of your app",
    choices: ["bot", "site"],
    default: type,
  }));
}

export function promptAppVersion(): Promise<string> {
  return promptTrier(() => select({
    message: "Input the engine version of your app",
    choices: ["latest", "current", "suja"],
    default: "latest",
  }));
}
