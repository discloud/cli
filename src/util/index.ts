import { RouteBases } from "@discloudapp/api-types/v2";
import archiver from "archiver";
import { GlobSync } from "glob";
import { filesystem, http } from "gluegun";
import { readFileSync } from "node:fs";
import type { RawFile, ResolveArgsOptions } from "../@types";
import { configPath } from "./constants";

export class FsJson {
  data: Record<string, any> = {};

  constructor(public path: string) {
    this.data = filesystem.read(path, "json") ?? {};
  }

  write(data: Record<string, any>, path = this.path) {
    this.data = { ...this.data, ...data };
    filesystem.write(path, this.data, { jsonIndent: 0 });
    return this.data;
  }
}

export const config = new class Config extends FsJson {
  constructor() {
    super(`${configPath}/.cli`);
  }
};

export const apidiscloud = http.create({
  baseURL: RouteBases.api,
  headers: {
    "api-token": config.data.token,
  },
});

export function resolveArgs(args: string[], options: ResolveArgsOptions[]) {
  const resolved = <Record<string, string | undefined>>{};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    for (let j = 0; j < options.length; j++) {
      const option = options[j];

      if (option.pattern.test(arg)) {
        resolved[option.name] = arg;

        args.splice(i, 1);
        i--;

        options.splice(j, 1);
        j--;
      }
    }
  }

  return resolved;
}

export async function resolveFile(file: string): Promise<RawFile> {
  if (typeof file === "string") {
    return {
      name: file.split("/").pop()!,
      data: readFileSync(file),
      key: "file",
    };
  }

  return file;
}

export function configToObj(s: string): Record<any, any> {
  return Object.fromEntries(s.split(/\r?\n/).map(a => a.split("=")));
}

export function getMissingValues(obj: Record<any, any>, match: string[]) {
  return Object.entries(obj).reduce<string[]>((acc, cur) =>
    match.includes(cur[0]) ?
      cur[1] ?
        acc :
        acc.concat(cur[0]) :
      acc, []);
}

export function getGitIgnore(path: string) {
  return (filesystem.read(".gitignore", "utf8") ?? "")
    .replace(/#[^\n]+/g, "")
    .split(/\r?\n/)
    .filter(a => a && ![".env", "discloud.config"].includes(a))
    .concat([".git", "node_modules"])
    .map(a => `${path}/${a.replace(/^\/|\/$/, "")}/**`);
}

export function getNotIngnoredFiles(path: string) {
  const ignore = getGitIgnore(path);

  return new GlobSync(`${path}/**`, { ignore, dot: true }).found.filter(a => !["."].includes(a));
}

export async function makeZipFromFileList(files: string[]) {
  const zipper = archiver("zip");

  const outFileName = `${process.cwd().split(/\/|\\/).pop()}.zip`;
  const output = filesystem.createWriteStream(outFileName);
  zipper.pipe(output);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (filesystem.isFile(file))
      zipper.append(filesystem.createReadStream(file), { name: file.replace(/^\.\//, "") });
  }

  await zipper.finalize();

  return outFileName;
}

export function objToString(obj: any): string {
  const result = [];

  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++)
        result.push(objToString(obj[i]));
    } else {
      const keys = Object.keys(obj);

      for (let i = 0; i < keys.length; i++)
        result.push(`${keys[i]}: ${objToString(obj[keys[i]])}`);
    }
  } else {
    result.push(obj);
  }

  return result.join("\n");
}