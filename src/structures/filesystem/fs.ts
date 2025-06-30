import { Ignore } from "@discloudapp/util";
import { spawn } from "child_process";
import { on } from "events";
import { existsSync, type Dirent } from "fs";
import { glob, readdir, readFile, writeFile } from "fs/promises";
import { globIterate } from "glob";
import { type } from "os";
import { join, relative } from "path";
import type Core from "../../core";
import { type FileSystemReadDirWithFileTypesOptions, type IFileSystem } from "../../interfaces/filesystem";
import { CONFIG_FILENAME } from "../../services/discloud/constants";
import { asyncGeneratorToArray } from "../../utils/array";
import { MINUTE_IN_MILLISECONDS } from "../../utils/constants";

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
    return asyncGeneratorToArray(this.globIterate(pattern, cwd));
  }

  async *globIterate(pattern: string | string[], cwd: string = this.core.workspaceFolder) {
    const ignoreModule = new Ignore(CONFIG_FILENAME);
    const ignore = await ignoreModule.getIgnorePatterns(cwd);

    yield* globIterate(pattern, {
      cwd,
      dot: true,
      ignore,
      nodir: true,
      windowsPathsNoEscape: type() === "Windows_NT",
    });
  }

  protected async *_fsGlobIterate(pattern: string | string[], cwd: string = this.core.workspaceFolder) {
    const ignoreModule = new Ignore(CONFIG_FILENAME);
    const exclude = await ignoreModule.getIgnorePatterns(cwd);

    yield* glob(pattern, {
      cwd,
      exclude,
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
    return Buffer.concat(await asyncGeneratorToArray(this.zipIterate(glob, cwd)));
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
