import { exec } from "child_process";
import { existsSync, type Dirent } from "fs";
import { readdir, readFile } from "fs/promises";
import { glob } from "glob";
import { type } from "os";
import { join, relative } from "path";
import { type FileSystemInterface, type FileSystemReadDirWithFileTypesOptions } from "../../interfaces/filesystem";
import { MAX_ZIP_BUFFER } from "../../services/discloud/constants";
import Ignore from "./ignore";

export default class FileSystem implements FileSystemInterface {
  asAbsolutePath(path: string, cwd: string = process.cwd()): string {
    return join(cwd, path);
  }

  asRelativePath(path: string, cwd: string = process.cwd()): string {
    return relative(cwd, join(cwd, path));
  }

  async zip(glob: string | string[], cwd: string = process.cwd()) {
    if (Array.isArray(glob)) glob = glob.join(" ");

    const encoding = "base64";

    const response = await new Promise<string>(function (resolve, reject) {
      exec(`discloud zip -e=${encoding} -g=${glob ?? "**"}`, {
        cwd,
        maxBuffer: MAX_ZIP_BUFFER,
      }, function (error, stdout, _stderr) {
        if (error) return reject(error);
        resolve(stdout);
      });
    }).then(r => r.split(/[\r\n]+/));

    let result = "";
    for (let i = 1; i < response.length; i++) {
      if (response[i].length > result.length) result = response[i];
    }

    return Buffer.from(result, encoding);
  }

  exists(path: string, cwd: string = process.cwd()): boolean {
    return existsSync(join(cwd, path));
  }

  async glob(pattern: string | string[]): Promise<string[]> {
    const ignoreModule = new Ignore();
    const ignoreFiles = await ignoreModule.findIgnoreFiles();
    const ignore = await ignoreModule.resolveIgnoreFiles(ignoreFiles);

    return glob(pattern, {
      nodir: true,
      dot: true,
      ignore,
      windowsPathsNoEscape: type() === "Windows_NT",
    });
  }

  readdir(path: string, recursive?: boolean): Promise<string[]>
  readdir(path: string, options: FileSystemReadDirWithFileTypesOptions): Promise<Dirent[]>
  async readdir(path: string, recursive?: boolean | FileSystemReadDirWithFileTypesOptions) {
    if (typeof recursive === "boolean") return await readdir(path, { recursive });
    return await readdir(path, recursive!);
  }

  readFile(path: string): Promise<Buffer>;
  readFile(path: string, encoding: BufferEncoding): Promise<string>;
  async readFile(path: string, encoding?: BufferEncoding) {
    return await readFile(path, encoding);
  }
}
