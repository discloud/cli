import { type Dirent } from "fs";
import { readdir, readFile } from "fs/promises";
import { glob } from "glob";
import { type } from "os";
import { type FileSystemInterface, type FileSystemReadDirWithFileTypesOptions } from "../../interfaces/filesystem";
import Ignore from "./ignore";

export default class FileSystem implements FileSystemInterface {
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
