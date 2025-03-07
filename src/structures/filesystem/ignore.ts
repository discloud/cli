import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { glob } from "glob";
import { globifyGitIgnore } from "globify-gitignore";
import { dirname, isAbsolute } from "path";
import { IGNORE_FILENAME } from "../../utils/constants";
import { joinWithRoot } from "../../utils/path";

export default class Ignore {
  async findIgnoreFiles() {
    const path = joinWithRoot(IGNORE_FILENAME);

    const patterns = await this.#getGlobfiedIgnore(path);

    const files = await glob(`**/${IGNORE_FILENAME}`, {
      dot: true,
      ignore: patterns,
      nodir: true,
    });

    return files;
  }

  async resolveIgnoreFiles(files: string[]) {
    return this.#getGlobfiedIgnores(files);
  }

  async #getGlobfiedIgnores(files: string[]) {
    const promises = [];

    for (let i = 0; i < files.length; i++) {
      promises.push(this.#getGlobfiedIgnore(files[i]));
    }

    const result = await Promise.all(promises);

    return result.flat();
  }

  async #getGlobfiedIgnore(path: string) {
    const patterns: string[] = [];

    if (existsSync(path)) {
      const content = await this.#readIgnoreFile(path);
      const absolute = isAbsolute(path);

      const globfiedEntries = await globifyGitIgnore(content, absolute ? void 0 : dirname(path), !absolute);

      for (let i = 0; i < globfiedEntries.length; i++) {
        patterns.push(globfiedEntries[i].glob);
      }
    }

    return patterns;
  }

  #readIgnoreFile(path: string) {
    return readFile(path, "utf8");
  }
}
