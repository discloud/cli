export interface ZipInterface {
  /**
   * @param cwd default `process.cwd()`
   */
  appendFiles(files: string[], cwd?: string): Promise<void>
  getBuffer(): Buffer
  writeZip(targetFileName?: string): Promise<boolean>
}
