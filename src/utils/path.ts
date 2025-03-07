import { join, relative } from "path";
import { buildRootPath, rootPath } from "..";

export function joinWithBuildRoot(...path: string[]) {
  return join(buildRootPath, ...path);
}

export function relativeFromBuildRoot(...path: string[]) {
  return relative(rootPath, joinWithBuildRoot(...path));
}
