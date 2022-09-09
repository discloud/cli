import { RouteBases } from "@discloudapp/api-types/v2";
import archiver from "archiver";
import { GlobSync } from "glob";
import { filesystem, http, print } from "gluegun";
import type { ResolveArgsOptions } from "../@types";
import { blocked_files, configPath, required_files } from "./constants";
import FsJson from "./FsJson";

export const config = new class Config extends FsJson {
  data: {
    limited?: string
    token?: string
  } = this.data;

  constructor() {
    super(`${configPath}/.cli`);
  }
};

export * from "./RateLimit";

export const apidiscloud = http.create({
  baseURL: RouteBases.api,
  headers: {
    "api-token": config.data.token,
  },
});

export function configToObj(s: string): Record<any, any> {
  if (typeof s !== "string") return {};
  return Object.fromEntries(s.split(/\r?\n/).map(a => a.split("=")));
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

export function configUpdate(save: Record<string, string>, path = ".") {
  path = path.replace(/\/$/, "");
  path = filesystem.exists(`${path}/discloud.config`) ? path : ".";

  const data = { ...configToObj(filesystem.read(`${path}/discloud.config`)!), ...save };

  filesystem.write(`${path}/discloud.config`, objToString(data, "="));
}

export function getGitIgnore(path: string) {
  return [...new Set(Object.values(blocked_files).flat())]
    .map(a => [`${a.replace(/^\/|\/$/, "")}/**`, `${path}/${a.replace(/^\/|\/$/, "")}/**`]).flat();
}

function getKeys(array: Record<string, any>[]) {
  const keys = <string[]>[];
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    keys.push(...Object.keys(element));
  }
  return [...new Set(keys)];
}

export function getMissingValues(obj: Record<any, any>, match: string[]) {
  return match.filter(key => !obj[key]);
}

export function getNotIngnoredFiles(path: string) {
  const ignore = getGitIgnore(path);

  path = (filesystem.isDirectory(path) || [".", "./"].includes(path) || !/\W+/.test(path)) ?
    `${path.replace(/\/$/, "")}/**` :
    path;

  return new GlobSync(path, { ignore, dot: true }).found.filter(a => !["."].includes(a));
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
  if (!apps) return [];
  if (!Array.isArray(apps)) return makeTable([apps]);
  const { keys, values } = getValues(apps);
  return [keys, ...values];
}

export async function makeZipFromFileList(files: string[]) {
  const zipper = archiver("zip");

  const outFileName = `${process.cwd().split(/\/|\\/).pop()}.zip`;
  const output = filesystem.createWriteStream(outFileName);
  zipper.pipe(output);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file.replace(/^\.\//, "");

    if (filesystem.isFile(file)) {
      const spin = print.spin({
        text: `Zipping file: ${fileName}`,
      });

      zipper.append(filesystem.createReadStream(file), { name: fileName });

      spin.succeed();
    }
  }

  await zipper.finalize();

  return outFileName;
}

export function objToString(obj: any, sep = ": "): string {
  if (!obj) return "";

  const result = [];

  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++)
        result.push(objToString(obj[i]));
    } else {
      const keys = Object.keys(obj);

      for (let i = 0; i < keys.length; i++)
        result.push(`${keys[i]}${sep}${objToString(obj[keys[i]])}`);
    }
  } else {
    result.push(obj);
  }

  return result.join("\n");
}

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

export function verifyRequiredFiles(path: string, ext: keyof typeof required_files) {
  const requiredFiles = Object.values(required_files[ext]).concat("discloud.config");

  for (let i = 0; i < requiredFiles.length; i++) {
    const file = requiredFiles[i];

    if (!filesystem.exists(`${path}/${file}`))
      return print.error(`${file} is missing.`);
  }

  return true;
}