import AdmZip from "adm-zip";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { type IZip } from "../../interfaces/zip";

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

  getBuffer() {
    return this.zip.toBufferPromise();
  }

  writeZip(targetFileName?: string) {
    return this.zip.writeZipPromise(targetFileName, { overwrite: true });
  }
}
