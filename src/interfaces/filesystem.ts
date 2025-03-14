import { type Dirent } from "fs";
import { type writeFile } from "fs/promises";

export interface FileSystemReadDirWithFileTypesOptions {
  recursive?: boolean
  withFileTypes: true
}

export interface FileSystemInterface {
  /**
   * @param cwd default `process.cwd()`
   */
  asAbsolutePath(path: string, cwd?: string): string

  /**
   * @param cwd default `process.cwd()`
   */
  asRelativePath(path: string, cwd?: string): string

  /**
   * @param cwd default `process.cwd()`
   */
  exists(path: string, cwd?: string): boolean

  glob(pattern: string | string[]): Promise<string[]>

  readdir(path: string, recursive?: boolean): Promise<string[]>
  readdir(path: string, options: FileSystemReadDirWithFileTypesOptions): Promise<Dirent[]>

  readFile(path: string): Promise<Buffer>
  readFile(path: string, encoding: BufferEncoding): Promise<string>
  readFile(path: string, encoding?: BufferEncoding): Promise<Buffer | string>

  writeFile(...args: Parameters<typeof writeFile>): Promise<void>

  /**
   * @param cwd default `process.cwd()`
   */
  zip(glob: string | string[], cwd?: string): Promise<Buffer>
}
