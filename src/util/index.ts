import { APT, APTPackages, RouteBases } from "@discloudapp/api-types/v2";
import { filesystem, http, print } from "@discloudapp/gluegun";
import type { ConfigData, ResolveArgsOptions } from "../@types";
import { configPath, FileExt, required_files, version } from "./constants";
import FsJson from "./FsJson";
import GS from "./GS";

export * from "./DiscloudConfig";
export * from "./FsJson";
export * from "./GS";
export * from "./RateLimit";
export * from "./Zip";

export const config = new class Config extends FsJson<ConfigData> {
  constructor() {
    super(`${configPath}/.cli`, { encoding: "base64" });
  }
};

export const apidiscloud = http.create({
  baseURL: RouteBases.api,
  headers: {
    "api-token": config.data.token,
    "User-Agent": `DiscloudCLI v${version}`,
  },
});

export function aptValidator(apts: keyof typeof APT | typeof APTPackages) {
  if (typeof apts === "string")
    apts = <typeof APTPackages>apts.split(/\W/g);

  return apts.map(apt => <keyof typeof APT>apt.toLowerCase()).filter(apt => APTPackages.includes(apt));
}

export function getFileExt(ext: `${keyof typeof FileExt}`) {
  return FileExt[ext] ?? ext;
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
  if (!apps) return [];
  if (!Array.isArray(apps)) return makeTable([apps]);
  const { keys, values } = getValues(apps);
  return [keys, ...values];
}

export function normalizePathlike(path = "**") {
  return path.replace(/\\/g, "/").replace(/^(\.|~)$|^(\.|~)\/|^\/|\/$/g, "");
}

export function objToString(obj: any, sep = ": "): string {
  if (!obj) return obj;

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

export function arrayOfPathlikeProcessor(paths: string[], files: string[] = []) {
  if (!paths?.length) paths = ["**"];
  for (let i = 0; i < paths.length; i++)
    files.push(...new GS(normalizePathlike(paths[i]), ".discloudignore").found);
  return files;
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

export function sortAppsBySameId<T extends { id: string }>(apps: T[], id: string) {
  return apps.sort(a => a.id === id ? -1 : 1);
}

export function verifyRequiredFiles(
  paths: string[],
  ext: `${keyof typeof FileExt}`,
  files: string | string[] = [],
) {
  const fileExt = getFileExt(ext);
  const requiredFiles = Object.values(required_files[fileExt] ?? {}).concat(required_files.common, files);

  for (let i = 0; i < requiredFiles.length; i++) {
    const file = requiredFiles[i];

    for (let j = 0; j < paths.length; j++) {
      const path = normalizePathlike(paths[j]);

      if (filesystem.exists(`${path}/${file}`) || filesystem.exists(file)) {
        requiredFiles.splice(i, 1);
        i--;
      }
    }
  }

  if (requiredFiles.length)
    return print.error(`Missing: ${requiredFiles.join(", ")}`);

  return true;
}