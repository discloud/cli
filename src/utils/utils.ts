import { readFileSync } from "fs";
import { join } from "path";
import { ROOT_PATH } from "..";

export function getPackageJSON() {
  return importJSON<any>(join(ROOT_PATH, "package.json"));
}

const JSONs: Record<any, any> = {};
export function importJSON<T>(path: string): Promise<T> {
  return JSONs[path] ??= JSON.parse(readFileSync(path, "utf8"));
}
