import { exec } from "child_process";
import { existsSync, rmSync } from "fs";
import { stat } from "fs/promises";
import { suite, test } from "node:test";

suite("Testing zip command", async () => {
  await test("Getting a empty zip base64", async (t) => {
    const encoding = "base64";
    const filePath = `__not_expected_files__${Math.random()}`;

    /** @external adm-zip@^0.5.16 */
    const expected = "UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==";

    /** @type {string} */
    const responseBase64 = await executeZipCommand(filePath, { encoding });

    t.assert.equal(responseBase64, expected);
  });

  await test("Getting a zip base64 with a file", async (t) => {
    const encoding = "base64";
    const filePath = "test/mock/zip_tester.txt";
    /** @external adm-zip@^0.5.16 */
    const expected = "UEsDBBQAAAgIAMpYbVrDN2OMEQAAAA8AAAAYAAAAdGVzdC9tb2NrL3ppcF90ZXN0ZXIudHh0U1Zw8Vfw8w9RCHL19Q9zBQBQSwECFAoUAAAICADKWG1awzdjjBEAAAAPAAAAGAAAAAAAAAAAAAAAtoEAAAAAdGVzdC9tb2NrL3ppcF90ZXN0ZXIudHh0UEsFBgAAAAABAAEARgAAAEcAAAAAAA==";

    /** @type {string} */
    const responseBase64 = await executeZipCommand(filePath, { encoding });

    t.assert.equal(responseBase64, expected);
  });

  await test("Writting a empty zip", async (t) => {
    t.after((t) => {
      rmSync(out);
      t.assert.ok(!existsSync(out))
    });

    const glob = `__not_expected_files__${Math.random()}`;
    const out = `test/__empty__${Math.random()}.zip`;
    /** @external adm-zip@^0.5.16 */
    const expectedFileSize = 22;

    await executeZipCommand(glob, { out });

    t.assert.ok(existsSync(out));

    const fileStat = await stat(out);

    t.assert.strictEqual(fileStat.size, expectedFileSize)
  });

  await test("Writting a zip with a file", async (t) => {
    t.after((t) => {
      rmSync(out);
      t.assert.ok(!existsSync(out))
    });

    const glob = "test/mock/zip_tester.txt";
    const out = `test/__filled__${Math.random()}.zip`;
    /** @external adm-zip@^0.5.16 */
    const expectedFileSize = 163;

    await executeZipCommand(glob, { out });

    t.assert.ok(existsSync(out));

    const fileStat = await stat(out);

    t.assert.strictEqual(fileStat.size, expectedFileSize)
  });

  /**
   * @overload
   * @param {string} [glob]
   * @param {OptionsWithEncoding} options
   * @returns {Promise<string>}
   * @typedef OptionsWithEncoding
   * @prop {BufferEncoding} encoding
   * 
   * @overload
   * @param {string} [glob]
   * @param {OptionsWithOut} options
   * @returns {Promise<void>}
   * @typedef OptionsWithOut
   * @prop {string} out
   */
  function executeZipCommand(glob, options) {
    /** `100MB` */
    const MAX_ZIP_BUFFER = 104_857_600;
    const MINUTE_IN_MILLISECONDS = 60_000;
    const zipCommand = "discloud zip";
    const localBinCommand = "bin/" + zipCommand;

    const command = [
      "node",
      localBinCommand,
      ...options?.encoding ? ["--encoding", options.encoding] : [],
      ...options?.out ? ["--out", options.out] : [],
      glob,
    ].join(" ");

    return new Promise(function (resolve, reject) {
      exec(command, {
        maxBuffer: MAX_ZIP_BUFFER,
        timeout: MINUTE_IN_MILLISECONDS,
      }, function (error, stdout, _stderr) {
        if (error) return reject(error);

        const parts = stdout.split(/[\r\n]+/);

        let result = "", isSkipped = false;
        for (let i = 0; i < parts.length; i++) {
          if (!isSkipped) {
            if (parts[i].includes(zipCommand)) isSkipped = true;
            continue;
          }
          if (parts[i].length > result.length) result = parts[i];
        }

        resolve(result);
      });
    });
  }
});
