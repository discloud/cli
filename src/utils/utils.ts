import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import { normalize } from "path";
import { joinWithRoot } from "./path";

export function getPackageJSON() {
  return importJSON<any>(joinWithRoot("package.json"));
}

const JSONs: Record<any, any> = {};
export function importJSON<T>(path: string): T
export function importJSON<T>(path: string, async: true): Promise<T>
export function importJSON<T>(path: string, async?: boolean): T {
  path = normalize(path);
  if (async) return JSONs[path] ?? readFile(path, "utf8").then(content => JSONs[path] = JSON.parse(content));
  return JSONs[path] ??= JSON.parse(readFileSync(path, "utf8"));
}
