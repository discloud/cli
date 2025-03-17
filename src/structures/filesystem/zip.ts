import AdmZip from "adm-zip";
import { join } from "path";
import { type IZip } from "../../interfaces/zip";

export default class Zip implements IZip {
  readonly zip: AdmZip;

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

      this.zip.addLocalFile(join(cwd, file), void 0, file);
    }
  }

  getBuffer() {
    return this.zip.toBufferPromise();
  }

  writeZip(targetFileName?: string) {
    return this.zip.writeZipPromise(targetFileName, { overwrite: true });
  }
}
