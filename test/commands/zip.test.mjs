import AdmZip from "adm-zip";
import { spawn } from "child_process";
import { on } from "events";
import { existsSync, rmSync } from "fs";
import { stat } from "fs/promises";
import { suite, test } from "node:test";
import { asyncGeneratorToArray } from "../utils/array.mjs";

suite("Testing zip command", async () => {
  await test("Getting a empty zip buffer", async (t) => {
    const encoding = "buffer";
    const filePath = `__not_expected_files__${Math.random()}`;
    const expectedEntryCount = 0;

    const buffer = await executeZipCommand(filePath, { encoding });

    const zipper = new AdmZip(buffer);

    t.assert.strictEqual(zipper.getEntryCount(), expectedEntryCount);
  });

  await test("Getting a zip buffer with a file", async (t) => {
    const encoding = "buffer";
    const filePath = "test/mock/zip_tester.txt";
    const expectedEntryCount = 1;
    const expectedEntryName = filePath;
    const expectedContent = "# DO NOT REMOVE";

    const buffer = await executeZipCommand(filePath, { encoding });

    const zipper = new AdmZip(buffer);

    t.assert.strictEqual(zipper.getEntryCount(), expectedEntryCount);

    const entries = zipper.getEntries();

    const [firstEntry] = entries;

    t.assert.strictEqual(firstEntry.entryName, expectedEntryName);

    t.assert.equal(firstEntry.getData().toString(), expectedContent);
  });

  await test("Writting a empty zip", async (t) => {
    t.after((t) => {
      rmSync(out);
      t.assert.ok(!existsSync(out));
    });

    const glob = `__not_expected_files__${Math.random()}`;
    const out = `test/__empty__${Math.random()}.zip`;
    /** @external adm-zip@^0.5.16 */
    const expectedFileSize = 22;

    await executeZipCommand(glob, { out });

    t.assert.ok(existsSync(out));

    const fileStat = await stat(out);

    t.assert.strictEqual(fileStat.size, expectedFileSize);
  });

  await test("Writting a zip with a file", async (t) => {
    t.after((t) => {
      rmSync(out);
      t.assert.ok(!existsSync(out));
    });

    const glob = "test/mock/zip_tester.txt";
    const out = `test/__filled__${Math.random()}.zip`;
    /** @external adm-zip@^0.5.16 */
    const expectedFileSize = 163;

    await executeZipCommand(glob, { out });

    t.assert.ok(existsSync(out));

    const fileStat = await stat(out);

    t.assert.strictEqual(fileStat.size, expectedFileSize);
  });

  /**
   * @overload
   * @param {string} [glob]
   * @param {OptionsWithEncoding} options
   * @returns {Promise<Buffer>}
   * @typedef OptionsWithEncoding
   * @prop {BufferEncoding | "buffer"} encoding
   * @prop {number} [maxBuffer]
   * 
   * @overload
   * @param {string} [glob]
   * @param {OptionsWithOut} options
   * @returns {Promise<void>}
   * @typedef OptionsWithOut
   * @prop {string} out
   */
  async function executeZipCommand(glob, options) {
    return Buffer.concat(await asyncGeneratorToArray(zipGenerator(glob, options)));
  }

  /**
   * @param {string} [glob]
   * @param {OptionsWithEncoding} [options]
   * @returns {AsyncGenerator<Buffer>}
   * 
   * @typedef OptionsWithEncoding
   * @prop {BufferEncoding | "buffer"} encoding
   */
  async function* zipGenerator(glob, options) {
    const MINUTE_IN_MILLISECONDS = 60_000;

    const zipCommand = "discloud zip";
    const localBinCommand = "bin/" + zipCommand;

    const child = spawn("node", [
      localBinCommand,
      ...options?.encoding ? ["--encoding", options.encoding] : [],
      ...options?.out ? ["--out", options.out] : [],
      glob,
    ], {
      shell: true,
      stdio: "pipe",
      timeout: MINUTE_IN_MILLISECONDS,
    });

    for await (const [chunk] of on(child.stdout, "data", { close: ["end"] })) yield chunk;
  }
});
