import { RouteBases } from "@discloudapp/api-types/v2";
import archiver from "archiver";
import { GlobSync } from "glob";
import { filesystem, http, print } from "gluegun";
import { readFileSync } from "node:fs";
import type { RawFile, ResolveArgsOptions } from "../@types";
import { blocked_files, configPath, required_files } from "./constants";

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
  data: {
    limited?: string,
    token?: string
  } = this.data;

  constructor() {
    super(`${configPath}/.cli`);
  }
};

export class RateLimit {
  constructor(headers?: Record<string, string>) {
    this.limit(headers);
  }

  static get limited() {
    return new Date(config.data.limited!);
  }

  static get isLimited() {
    return this.limited >= new Date();
  }

  limit(headers?: Record<string, string>) {
    if (!headers) return;

    const remaining = Number(headers["ratelimit-remaining"]);
    if (isNaN(remaining)) return;
    if (remaining > 0) return;

    config.write({ limited: Date.now() + (Number(headers["ratelimit-reset"]) * 1000) });
  }
}

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
  if (typeof s !== "string") return {};
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
  return [...new Set(Object.values(blocked_files).flat())]
    .map(a => [`${a.replace(/^\/|\/$/, "")}/**`, `${path}/${a.replace(/^\/|\/$/, "")}/**`]).flat();
}

export function getNotIngnoredFiles(path: string) {
  const ignore = getGitIgnore(path);

  path = (filesystem.isDirectory(path) || [".", "./"].includes(path) || !/\W+/.test(path)) ?
    `${path.replace(/\/$/, "")}/**` :
    path;

  return new GlobSync(path, { ignore, dot: true }).found.filter(a => !["."].includes(a));
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

export function getFileExt(path: string) {
  const requiredFiles = Object.entries(required_files);

  for (let i = 0; i < requiredFiles.length; i++) {
    const fileEntries = requiredFiles[i];

    for (let j = 0; j < fileEntries[1].length; j++) {
      const file = fileEntries[1][j];

      if (filesystem.exists(`${path}/${file}`))
        return <keyof typeof required_files>fileEntries[0];
    }
  }
}

export function verifyRequiredFiles(path: string, ext: keyof typeof required_files) {
  const requiredFiles = Object.values(required_files[ext]).concat("discloud.config");

  for (let i = 0; i < requiredFiles.length; i++) {
    const file = requiredFiles[i];

    if (!filesystem.exists(`${path}/${file}`))
      return print.error(`${file} is missing.`);
  }

  return true;
}

function getKeys(array: Record<string, any>[]) {
  const keys = <string[]>[];
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    keys.push(...Object.keys(element));
  }
  return [...new Set(keys)];
}

function getValues(array: Record<string, any>[]) {
  const keys = getKeys(array);
  const values = <any[]>[];
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    const value = <any[]>[];
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];

      value.push(objToString(element[key]));
    }
    values.push(value);
  }
  return { keys, values };
}

export function makeTable(apps: Record<string, any> | Record<string, any>[]): any[] {
  if (!Array.isArray(apps)) return makeTable([apps]);
  const { keys, values } = getValues(apps);
  return [keys, ...values];
}