import { filesystem } from "@discloudapp/gluegun";
import { GlobSync } from "glob";
import { existsSync, readFileSync } from "node:fs";
import { blocked_files } from "./constants";

export class GS {
  found: string[] = [];
  ignore: string[] = [];
  ignoreFiles: string[] = [];

  constructor(public path = "**", ignoreFileName?: string) {
    this.path = path = this.normalizePath(path);

    if (ignoreFileName)
      this.ignoreFiles = this.findIgnoreFiles(ignoreFileName, path);

    this.ignore = this.getDiscloudIgnore(path);

    this.found = new GlobSync(path, {
      dot: true,
      ignore: this.ignore,
      windowsPathsNoEscape: true,
    }).found;
  }

  getDiscloudIgnore(path: string) {
    return [
      ...new Set(Object.values(blocked_files).flat()),
      ...this.resolveIgnoreFile(this.ignoreFiles),
    ]
      .map(a => [a, `${a}/**`, `**/${a}`, `**/${a}/**`, `${path}/${a}`, `${path}/${a}/**`]).flat();
  }

  normalizePath(path: string) {
    path = path.replace(/^(\.|~)$|^(\.|~)\/|^\/|\/$/g, "") || "**";
    path = filesystem.isDirectory(path) ? path + "/**" : path;
    return path;
  }

  findIgnoreFiles(fileName: string, path?: string) {
    const regex = RegExp(`${fileName}$`);

    const files = new GlobSync(path ?? "**", {
      dot: true,
      windowsPathsNoEscape: true,
    });

    return files.found.filter(f => regex.test(f));
  }

  resolveIgnoreFile(ignoreFile: string | string[]) {
    if (Array.isArray(ignoreFile)) {
      const ignored = <string[]>[];

      for (let i = 0; i < ignoreFile.length; i++)
        ignored.push(...this.resolveIgnoreFile(ignoreFile[i]));

      return ignored;
    }

    if (ignoreFile)
      if (existsSync(ignoreFile))
        return readFileSync(ignoreFile, "utf8")
          .replace(/#[^\r?\n]+/g, "")
          .split(/\r?\n/)
          .filter(a => a);

    return [];
  }
}

export default GS;