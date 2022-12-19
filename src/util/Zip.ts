import archiver from "archiver";
import { filesystem, print } from "gluegun";

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

        zipper.append(filesystem.createReadStream(name), { name });
      }

      amountZippedFiles++;
    } catch (error) {
      spin.fail(`Error on zipping ${name}.`);
    }
  }

  spin.succeed(`[${amountZippedFiles}/${files.length}] Successfully zipped files.`);

  return zipper.finalize().then(() => outFileName);
}