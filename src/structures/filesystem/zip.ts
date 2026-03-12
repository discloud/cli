import { fsGlobIterate, globIterate } from "@discloudapp/util";
import AdmZip from "adm-zip";
import { readFile, stat } from "fs/promises";
import { join, relative } from "path";
import type Core from "../../core";
import { type IZip } from "../../interfaces/zip";
import { normalizeGlobPattern } from "../../utils/glob";

export default class Zip implements IZip {
  declare readonly zip: AdmZip;

  constructor(readonly core: Core) {
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

      const buffer = await readFile(localPath);

      this.zip.addFile(zipName, buffer, undefined, fileStat.mode);
    }
  }

  async glob(pattern: string | string[], cwd: string = process.cwd()) {
    this.core.print.debug("Normalizing glob pattern: %s", pattern);

    pattern = normalizeGlobPattern(pattern);

    this.core.print.debug("Normalized glob pattern: %s", pattern);

    for await (const zipName of globIterate(pattern, cwd)) {
      const localPath = join(cwd, zipName);

      let fileStat;
      try { fileStat = await stat(localPath); }
      catch { continue; }

      if (!fileStat.isFile()) continue;

      this.core.print.debug("File found: %s", zipName);

      const buffer = await readFile(localPath);

      this.zip.addFile(zipName, buffer, undefined, fileStat.mode);
    }

    this.core.print.debug("Successfully zipped");
  }

  protected async _fsGlob(pattern: string | string[], cwd: string = process.cwd()) {
    for await (const dirent of fsGlobIterate(pattern, { cwd, withFileTypes: true })) {
      const localPath = join(dirent.parentPath, dirent.name);

      let fileStat;
      try { fileStat = await stat(localPath); }
      catch { continue; }

      if (!fileStat.isFile()) continue;

      const buffer = await readFile(localPath);

      const zipName = relative(cwd, localPath);

      this.zip.addFile(zipName, buffer, undefined, fileStat.mode);
    }
  }

  getBuffer() {
    return this.zip.toBufferPromise();
  }

  writeZip(targetFileName?: string) {
    return this.zip.writeZipPromise(targetFileName, { overwrite: true });
  }
}
