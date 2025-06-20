export interface IZip {
  get fileCount(): number
  /**
   * @param cwd default `process.cwd()`
   */
  appendFiles(files: string[], cwd?: string): Promise<void>
  /**
   * @param cwd default `process.cwd()`
   */
  glob(pattern: string | string[], cwd?: string): Promise<void>
  getBuffer(): Promise<Buffer>
  writeZip(targetFileName?: string): Promise<boolean>
}
