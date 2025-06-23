import AdmZip from "adm-zip";
import { stat } from "fs/promises";
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
      const zipName = files[i];

      const localPath = join(cwd, zipName);

      let fileStat;
      try { fileStat = await stat(localPath); }
      catch { continue; }

      if (!fileStat.isFile()) continue;

      await new Promise<void>((resolve, reject) => {
        // @ts-expect-error ts(2551)
        this.zip.addLocalFileAsync({ localPath, zipName }, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
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
    });

    for await (const zipName of globIterator) {
      const localPath = join(cwd, zipName);

      await new Promise<void>((resolve, reject) => {
        // @ts-expect-error ts(2551)
        this.zip.addLocalFileAsync({ localPath, zipName }, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
  }

  getBuffer() {
    return this.zip.toBufferPromise();
  }

  writeZip(targetFileName?: string) {
    return this.zip.writeZipPromise(targetFileName, { overwrite: true });
  }
}
