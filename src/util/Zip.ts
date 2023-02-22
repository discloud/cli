import { filesystem, print } from "@discloudapp/gluegun";
import archiver from "archiver";
import { MakeZipArgs } from "../@types";

export async function makeZip(args: MakeZipArgs = {}) {
  const { debug, fileName, ignore = [], path = "**" } = args;
  const zipper = archiver("zip");

  const outFileName = fileName ?? `${process.cwd().split(/(\\|\/)/).pop()}.zip`;
  ignore.push(outFileName, `${path}/${outFileName}`);

  if (filesystem.exists(outFileName))
    filesystem.remove(outFileName);

  const output = filesystem.createWriteStream(outFileName);
  zipper.pipe(output);

  zipper.glob(path, { dot: true, ignore, debug });

  return zipper.finalize().then(() => outFileName);
}

export async function makeZipFromFileList(files: string[], fileName?: string | null, debug?: boolean) {
  const zipper = archiver("zip");

  const outFileName = fileName ?? `${process.cwd().split(/(\\|\/)/).pop()}.zip`;

  if (filesystem.exists(outFileName))
    filesystem.remove(outFileName);

  const output = filesystem.createWriteStream(outFileName);
  zipper.pipe(output);

  let amountZippedFiles = 0;

  const spin = print.spin({
    text: "Zipping files",
  });

  for (let i = 0; i < files.length; i++) {
    const name = files[i];

    try {
      if (filesystem.isFile(name)) {
        if (debug)
          spin.info(`[${i + 1}/${files.length}] Zipping: ${name}`);

        spin.text = `[${i + 1}/${files.length}] Zipping: ${name}`;

        zipper.file(name, { name });
      } else if (filesystem.isDirectory(name)) {
        zipper.file(name, { name });
      }

      amountZippedFiles++;
    } catch (error) {
      spin.fail(`Error on zipping ${name}.`);
    }
  }

  spin.succeed(`[${amountZippedFiles}/${files.length}] Successfully zipped files.`);

  return zipper.finalize().then(() => outFileName);
}