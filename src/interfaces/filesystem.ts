import { type Dirent } from "fs";

export interface FileSystemReadDirWithFileTypesOptions {
  recursive?: boolean
  withFileTypes: true
}

export interface FileSystemInterface {
  glob(pattern: string | string[]): Promise<string[]>

  readdir(path: string, recursive?: boolean): Promise<string[]>
  readdir(path: string, options: FileSystemReadDirWithFileTypesOptions): Promise<Dirent[]>

  readFile(path: string): Promise<Buffer>
  readFile(path: string, encoding: BufferEncoding): Promise<string>
  readFile(path: string, encoding?: BufferEncoding): Promise<Buffer | string>
}
