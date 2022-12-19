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
    const file = files[i];
    const fileName = file.replace(/^[.\\/]+/, "");

    try {
      if (filesystem.isFile(file)) {
        if (debug)
          spin.info(`[${i + 1}/${files.length}] Zipping: ${fileName}`);

        spin.text = `[${i + 1}/${files.length}] Zipping: ${fileName}`;

        zipper.append(filesystem.createReadStream(file), { name: fileName });
      }

      amountZippedFiles++;
    } catch (error) {
      spin.fail(`Error on zipping ${file}.`);
    }
  }

  spin.succeed(`[${amountZippedFiles}/${files.length}] Successfully zipped files.`);

  return zipper.finalize().then(() => outFileName);
}