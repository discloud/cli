import { IgnoreFiles } from "@discloudapp/util";
import { GlobSync } from "glob";
import { statSync } from "node:fs";
import { isAbsolute } from "node:path";

export class GS {
  found: string[] = [];
  ignore: IgnoreFiles;

  constructor(public path: string, ignoreFileName?: string, ignore: string[] = []) {
    this.ignore = new IgnoreFiles({
      fileName: ignoreFileName!,
      path,
      optionalIgnoreList: ignore,
    });

    this.path = this.#normalizePath(path);

    this.found = new GlobSync(this.path, {
      dot: true,
      ignore: this.ignore.list,
    }).found;
  }

  #normalizePath(path: string) {
    try {
      path = path.replace(/\\/g, "/");

      if (!isAbsolute(path))
        path = path.replace(/^(\.|~)$|^(\.|~)\/|^\/|\/$/g, "") || "**";

      path = path.replace(/\/$/, "");

      path = statSync(path).isDirectory() ? path + "/**" : path;
    } catch {
      path = path + "/**";
    }
    return path;
  }
}

export default GS;