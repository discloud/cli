import { RouteBases } from "@discloudapp/api-types/v2";
import { filesystem, http, print } from "gluegun";
import type { ResolveArgsOptions } from "../@types";
import { configPath, FileExt, required_files } from "./constants";
import FsJson from "./FsJson";

export * from "./GS";
export * from "./RateLimit";
export * from "./Zip";

export const config = new class Config extends FsJson {
  data: {
    limited?: string
    token?: string
  } = this.data;

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

export function configToObj<T = boolean | number | string>(s: string): Record<string, T> {
  if (typeof s !== "string") return {};
  return Object.fromEntries(s.split(/\r?\n/).map(a => a.split("=")));
}

export function configUpdate(save: Record<string, string>, path = ".") {
  path = path.replace(/(\\|\/)$/, "");
  path = filesystem.exists(`${path}/discloud.config`) ? path : ".";
  if (!filesystem.exists(`${path}/discloud.config`)) return;

  const data = { ...configToObj(filesystem.read(`${path}/discloud.config`)!), ...save };

  filesystem.write(`${path}/discloud.config`, objToString(data, "="));
}

export function findDiscloudConfig(path = "") {
  path = path.replace(/\\/g, "/").replace(/\/$/, "") + "/";
  const discloudConfigPaths = [`${path}`, ""];

  for (let i = 0; i < discloudConfigPaths.length; i++) {
    const discloudConfigPath = discloudConfigPaths[i];

    if (filesystem.exists(`${discloudConfigPath}discloud.config`))
      return discloudConfigPath;
  }
}

export function getFileExt(ext: `${FileExt}`) {
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

export function getMissingValues(obj: Record<any, any>, values: string[]) {
  return values.filter(key => !obj[key]);
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

export function readDiscloudConfig(path = "") {
  path = path.replace(/\\/g, "/").replace(/\/$/, "") + "/";
  return filesystem.read(`${path}discloud.config`) ?? filesystem.read("discloud.config") ?? "";
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
  path: string,
  ext: `${FileExt}`,
  files: string | string[] = [],
) {
  const fileExt = getFileExt(ext);
  const requiredFiles = Object.values(required_files[fileExt] ?? {}).concat(required_files.common, files);

  for (let i = 0; i < requiredFiles.length; i++) {
    const file = requiredFiles[i];

    if (!filesystem.exists(`${path}/${file}`))
      return print.error(`${file} is missing.`);
  }

  return true;
}