import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { glob } from "glob";
import { globifyGitIgnore } from "globify-gitignore";
import { type } from "os";
import { dirname } from "path";
import { setTimeout as sleep } from "timers/promises";
import { IGNORE_FILENAME } from "../../utils/constants";
import { joinWithRoot } from "../../utils/path";

export default class Ignore {
  async globify(content: string, directory?: string, absolute?: boolean) {
    const patterns = [];

    const entry = await globifyGitIgnore(content, directory, absolute);

    for (let i = 0; i < entry.length; i++) {
      if (!entry[i].included) patterns.push(entry[i].glob);
      await sleep();
    }

    return patterns;
  }

  async findIgnoreFiles(cwd: string = process.cwd()) {
    const path = joinWithRoot(IGNORE_FILENAME);

    const ignore = await this.#getGlobfiedIgnore(path);

    const windowsPathsNoEscape = type() === "Windows_NT";

    const files = await glob(`**/${IGNORE_FILENAME}`, {
      cwd,
      dot: true,
      ignore,
      nodir: true,
      windowsPathsNoEscape,
    });

    return files.concat(path);
  }

  resolveIgnoreFiles(files: string[]) {
    return this.#getGlobfiedIgnoreFiles(files);
  }

  async #getGlobfiedIgnoreFiles(files: string[]) {
    const promises = [];

    for (let i = 0; i < files.length; i++) {
      promises.push(this.#getGlobfiedIgnore(files[i]));
    }

    const result = await Promise.all(promises);

    return result.flat();
  }

  async #getGlobfiedIgnore(path: string) {
    const patterns = [];

    if (existsSync(path)) {
      const content = await this.#readIgnoreFile(path);

      patterns.push(await this.globify(content, dirname(path)));
    }

    return patterns.flat();
  }

  #readIgnoreFile(path: string) {
    return readFile(path, "utf8");
  }
}
