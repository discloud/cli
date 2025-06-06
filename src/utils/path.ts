import { join, relative } from "path";
import { BUILD_ROOT_PATH, ROOT_PATH } from "..";

export function joinWithBuildRoot(...path: string[]) {
  return join(BUILD_ROOT_PATH, ...path);
}

export function joinWithRoot(...path: string[]) {
  return join(ROOT_PATH, ...path);
}

export function relativeFromBuildRoot(...path: string[]) {
  return relative(BUILD_ROOT_PATH, joinWithBuildRoot(...path));
}
