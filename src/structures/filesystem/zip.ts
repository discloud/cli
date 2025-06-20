import AdmZip from "adm-zip";
import { readFile, stat } from "fs/promises";
import { globIterate } from "glob";
import { type } from "os";
import { join } from "path";
import { type IZip } from "../../interfaces/zip";
import Ignore from "./ignore";

export default class Zip implements IZip {
  declare readonly zip: AdmZip;

  constructor() {
    this.zip = new AdmZip();
  }

  get fileCount(): number {
    return this.zip.getEntryCount();
  }

  async appendFiles(files: string[], cwd: string = process.cwd()) {
    if (!files?.length) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const filePath = join(cwd, file);

      let stats;
      try { stats = await stat(filePath); }
      catch { continue; }

      if (!stats.isFile()) continue;

      const buffer = await readFile(filePath);

      this.zip.addFile(file, buffer);
    }
  }

  async glob(pattern: string | string[], cwd: string = process.cwd()) {
    const ignoreModule = new Ignore();
    const ignoreFiles = await ignoreModule.findIgnoreFiles(cwd);
    const ignore = await ignoreModule.resolveIgnoreFiles(ignoreFiles);

    const windowsPathsNoEscape = type() === "Windows_NT";

    const globIterator = globIterate(pattern, {
      cwd,
      dot: true,
      ignore,
      nodir: true,
      windowsPathsNoEscape,
      withFileTypes: true,
    });

    for await (const file of globIterator) {
      const filePath = file.fullpath();

      const buffer = await readFile(filePath);

      const fileRelativeName = file.relative();

      this.zip.addFile(fileRelativeName, buffer);
    }
  }

  getBuffer() {
    return this.zip.toBufferPromise();
  }

  writeZip(targetFileName?: string) {
    return this.zip.writeZipPromise(targetFileName, { overwrite: true });
  }
}
