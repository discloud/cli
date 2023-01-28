import { GlobSync } from "glob";
import { filesystem } from "@discloudapp/gluegun";
import { existsSync, readFileSync } from "node:fs";
import { blocked_files } from "./constants";

export class GS {
  found: string[];
  ignore: string[];

  constructor(public path = "**") {
    this.path = path = this.normalizePath(path);

    this.ignore = this.getDiscloudIgnore(path);

    this.found = new GlobSync(path, {
      dot: true,
      ignore: this.ignore,
    }).found;
  }

  getDiscloudIgnore(path: string) {
    return [
      ...new Set(Object.values(blocked_files).flat()),
      ...this.resolveIgnoreFile(".discloudignore"),
    ]
      .map(a => [a, `${a}/**`, `**/${a}`, `**/${a}/**`, `${path}/${a}`, `${path}/${a}/**`]).flat();
  }

  normalizePath(path: string) {
    path = path.replace(/^(\.|~)$|^(\.|~)\/|^\/|\/$/g, "") || "**";
    path = filesystem.isDirectory(path) ? path + "/**" : path;
    return path;
  }

  resolveIgnoreFile(ignoreFile: string | string[]) {
    if (Array.isArray(ignoreFile)) {
      const ignored = <string[]>[];

      for (let i = 0; i < ignoreFile.length; i++)
        ignored.push(...this.resolveIgnoreFile(ignoreFile[i]));

      return ignored;
    }

    if (existsSync(ignoreFile))
      return readFileSync(ignoreFile, "utf8")
        .replace(/#[^\r?\n]+/g, "")
        .split(/\r?\n/)
        .filter(a => a);

    return [];
  }
}

export default GS;