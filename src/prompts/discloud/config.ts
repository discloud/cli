import { APTPackages } from "@discloudapp/api-types/v2";
import { checkbox, confirm, number, search, select } from "@inquirer/prompts";
import { existsSync } from "fs";
import { readdir, stat } from "fs/promises";
import { dirname, join, sep } from "path/posix";
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
      const result: string[] = [];

      if (term) {
        let dir;
        if (existsSync(term)) {
          const fileStat = await stat(term);
          if (fileStat.isFile()) return [term];
          dir = term;
        } else {
          dir = dirname(term);
        }

        term = term.toLowerCase();

        const files = await readdir(dir, { withFileTypes: true });

        files.sort((a, b) => a.name.localeCompare(b.name, void 0, { sensitivity: "accent" }) +
          (a.isDirectory() ? -2 : 2) + (b.isDirectory() ? 2 : -2));

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          const filename = join(dir, file.name);

          if (filename.toLowerCase().includes(term)) result.push(filename + (file.isDirectory() ? sep : ""));
        }

        result.sort((a, b) => a.toLowerCase().indexOf(term!) - b.toLowerCase().indexOf(term!));

        return result;
      }

      const files = await readdir(".", { withFileTypes: true });

      files.sort((a, b) => a.name.localeCompare(b.name, void 0, { sensitivity: "accent" }) +
        (a.isDirectory() ? -2 : 2) + (b.isDirectory() ? 2 : -2));

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        result.push(file.name + (file.isDirectory() ? sep : ""));
      }

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
  }));
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
