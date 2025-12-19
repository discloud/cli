import { APTPackages } from "@discloudapp/api-types/v2";
import { checkbox, confirm, number, search, select } from "@inquirer/prompts";
import { open, readdir } from "fs/promises";
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

const localeOptions: Intl.CollatorOptions = { sensitivity: "accent" };
const dot = ".";

export function promptAppMain(): Promise<string> {
  return promptTrier(() => search({
    message: "Input the main file path of your app",
    async source(term, _opt) {
      if (term) {
        let dir;
        try {
          const fileHandle = await open(term);
          const fileStat = await fileHandle.stat();
          if (fileStat.isFile()) return [term];
          dir = term;
        } catch (_) {
          dir = dirname(term);
        }

        term = term.toLowerCase();

        const files = await readdir(dir, { withFileTypes: true });

        files.sort((a, b) => a.name.localeCompare(b.name, undefined, localeOptions) +
          (a.isDirectory() ? -2 : 2) + (b.isDirectory() ? 2 : -2));

        const result: string[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          const filename = join(dir, file.name);

          if (filename.toLowerCase().includes(term))
            result.push(filename + (file.isDirectory() ? sep : ""));
        }

        result.sort((a, b) => a.toLowerCase().indexOf(term!) - b.toLowerCase().indexOf(term!));

        return result;
      }

      const files = await readdir(dot, { withFileTypes: true });

      files.sort((a, b) => a.name.localeCompare(b.name, undefined, localeOptions) +
        (a.isDirectory() ? -2 : 2) + (b.isDirectory() ? 2 : -2));

      const result: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        result.push(file.name + (file.isDirectory() ? sep : ""));
      }

      return result;
    },
    async validate(value) {
      try {
        const fileHandle = await open(value);
        const fileStat = await fileHandle.stat();
        if (fileStat.isFile()) return true;
      } catch (_) { }
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
