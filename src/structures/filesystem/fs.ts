import { spawn } from "child_process";
import { on } from "events";
import { existsSync, type Dirent } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import { glob } from "glob";
import { type } from "os";
import { join, relative } from "path";
import type Core from "../../core";
import { type FileSystemReadDirWithFileTypesOptions, type IFileSystem } from "../../interfaces/filesystem";
import { MINUTE_IN_MILLISECONDS } from "../../utils/constants";
import Ignore from "./ignore";

export default class FileSystem implements IFileSystem {
  constructor(
    protected readonly core: Core,
  ) { }

  asAbsolutePath(path: string, cwd: string = this.core.workspaceFolder): string {
    return join(cwd, path);
  }

  asRelativePath(path: string, cwd: string = this.core.workspaceFolder): string {
    return relative(cwd, path);
  }

  exists(path: string, cwd: string = this.core.workspaceFolder): boolean {
    return existsSync(join(cwd, path));
  }

  async glob(pattern: string | string[], cwd: string = this.core.workspaceFolder): Promise<string[]> {
    const ignoreModule = new Ignore();
    const ignoreFiles = await ignoreModule.findIgnoreFiles(cwd);
    const ignore = await ignoreModule.resolveIgnoreFiles(ignoreFiles);

    const windowsPathsNoEscape = type() === "Windows_NT";

    return glob(pattern, {
      dot: true,
      ignore,
      nodir: true,
      windowsPathsNoEscape,
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

  async zip(glob: string | string[], cwd: string = this.core.workspaceFolder) {
    return Buffer.concat(await Array.fromAsync(this.zipIterate(glob, cwd)));
  }

  zipIterate(glob: string | string[], cwd?: string): AsyncGenerator<Buffer>
  async* zipIterate(glob: string | string[], cwd: string = this.core.workspaceFolder) {
    if (Array.isArray(glob)) glob = glob.join(" ");

    const encoding = "buffer";
    const zipCommand = "discloud zip";

    const child = spawn(zipCommand, ["-e", encoding, "-g", glob], {
      cwd,
      shell: true,
      stdio: "pipe",
      timeout: MINUTE_IN_MILLISECONDS,
    });

    let notSkippedFirstLine = true;
    for await (const [chunk] of on(child.stdout, "data", { close: ["end"] })) {
      if (notSkippedFirstLine) {
        notSkippedFirstLine = false;
        if (`${chunk}`.includes(zipCommand)) continue;
      }

      yield chunk;
    }
  }
}
