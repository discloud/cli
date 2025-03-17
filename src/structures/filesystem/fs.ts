import { exec } from "child_process";
import { existsSync, type Dirent } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import { type } from "os";
import { join, relative } from "path";
import type Core from "../../core";
import { type FileSystemReadDirWithFileTypesOptions, type IFileSystem } from "../../interfaces/filesystem";
import { MAX_STRING_LENGTH, MINUTE_IN_MILLISECONDS } from "../../utils/constants";
import Ignore from "./ignore";

export default class FileSystem implements IFileSystem {
  constructor(
    readonly core: Core,
  ) { }

  asAbsolutePath(path: string, cwd: string = process.cwd()): string {
    return join(cwd, path);
  }

  asRelativePath(path: string, cwd: string = process.cwd()): string {
    return relative(cwd, join(cwd, path));
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

  async writeFile(...args: Parameters<typeof writeFile>) {
    await writeFile(...args);
  }

  async zip(glob: string | string[], cwd: string = process.cwd()) {
    if (Array.isArray(glob)) glob = glob.join(" ");

    const encoding = "base64";
    const zipCommand = "discloud zip";

    const response = await new Promise<string>(function (resolve, reject) {
      exec(`${zipCommand} -e=${encoding} -g=${glob || "**"}`, {
        cwd,
        maxBuffer: MAX_STRING_LENGTH,
        timeout: MINUTE_IN_MILLISECONDS,
      }, function (error, stdout, _stderr) {
        if (error) return reject(error);
        const parts = stdout.split("\n");
        resolve(parts[parts[0].includes(zipCommand) ? 1 : 0]);
      });
    });

    return Buffer.from(response, encoding);
  }
}
