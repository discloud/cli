import { readFileSync } from "fs";
import { joinWithRoot } from "./path";

export function getPackageJSON() {
  return importJSON<any>(joinWithRoot("package.json"));
}

const JSONs: Record<any, any> = {};
export function importJSON<T>(path: string): Promise<T> {
  return JSONs[path] ??= JSON.parse(readFileSync(path, "utf8"));
}
