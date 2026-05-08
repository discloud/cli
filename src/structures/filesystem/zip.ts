import { globIterate } from "@discloudapp/util";
import AdmZip from "adm-zip";
import { readFile, stat } from "fs/promises";
import { join, relative } from "path";
import type Core from "../../core";
import { type IZip } from "../../interfaces/zip";
import { normalizeGlobPattern } from "../../utils/glob";

const PARALLEL_BATCH_SIZE = 20;

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

    for (let i = 0; i < files.length; i += PARALLEL_BATCH_SIZE) {
      const batch = files.slice(i, i + PARALLEL_BATCH_SIZE);

      await Promise.all(batch.map(async (zipName) => {
        const localPath = join(cwd, zipName);

        let fileStat;
        try { fileStat = await stat(localPath); }
        catch { return; }

        if (!fileStat.isFile()) return;

        const buffer = await readFile(localPath);

        this.zip.addFile(zipName, buffer, undefined, fileStat.mode);
      }));
    }
  }

  async glob(pattern: string[] | string, cwd: string = process.cwd()) {
    this.core.print.debug("Normalizing glob pattern: %s", pattern);

    pattern = normalizeGlobPattern(pattern);

    this.core.print.debug("Normalized glob pattern: %s", pattern);

    const paths: string[] = [];
    for await (const zipName of globIterate(pattern, cwd)) {
      paths.push(zipName);
    }

    this.core.print.debug("Found %d files, zipping in parallel batches of %d", paths.length, PARALLEL_BATCH_SIZE);

    for (let i = 0; i < paths.length; i += PARALLEL_BATCH_SIZE) {
      const batch = paths.slice(i, i + PARALLEL_BATCH_SIZE);

      await Promise.all(batch.map(async (zipName) => {
        const localPath = join(cwd, zipName);

        let fileStat;
        try { fileStat = await stat(localPath); }
        catch { return; }

        if (!fileStat.isFile()) return;

        this.core.print.debug("File found: %s", zipName);

        const buffer = await readFile(localPath);

        this.zip.addFile(zipName, buffer, undefined, fileStat.mode);
      }));
    }

    this.core.print.debug("Successfully zipped");
  }

  protected async _fsGlob(pattern: string[] | string, cwd: string = process.cwd()) {
    const { fsGlobIterate } = await import("@discloudapp/util");

    const dirents: Array<{ parentPath: string; name: string }> = [];
    for await (const dirent of fsGlobIterate(pattern, { cwd, withFileTypes: true })) {
      dirents.push({ parentPath: dirent.parentPath, name: dirent.name });
    }

    for (let i = 0; i < dirents.length; i += PARALLEL_BATCH_SIZE) {
      const batch = dirents.slice(i, i + PARALLEL_BATCH_SIZE);

      await Promise.all(batch.map(async ({ parentPath, name }) => {
        const localPath = join(parentPath, name);

        let fileStat;
        try { fileStat = await stat(localPath); }
        catch { return; }

        if (!fileStat.isFile()) return;

        const buffer = await readFile(localPath);
        const zipName = relative(cwd, localPath);

        this.zip.addFile(zipName, buffer, undefined, fileStat.mode);
      }));
    }
  }

  getBuffer() {
    return this.zip.toBufferPromise();
  }

  writeZip(targetFileName?: string) {
    return this.zip.writeZipPromise(targetFileName, { overwrite: true });
  }
}