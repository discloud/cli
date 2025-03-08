import { join } from "path";
import { type CommandInterface } from "../interfaces/command";
import { type ZipInterface } from "../interfaces/zip";
import Zip from "../structures/filesystem/zip";

interface CommandArgs {
  encoding?: BufferEncoding
  glob: string[]
}

export default <CommandInterface<CommandArgs>>{
  name: "zip",
  description: "Make zip",

  options: {
    encoding: {
      alias: "e",
      type: "string",
      choices: ["base64"],
      description: "Response encoding (This option doesn't create the zip file)",
    },
    glob: {
      alias: "g",
      type: "array",
      description: "Directories/files with glob pattern to zip",
      default: "**",
    },
  },

  async run(core, args) {
    const files = await core.fs.glob(args.glob);

    const zipper: ZipInterface = new Zip();

    zipper.appendFiles(files, core.workspaceFolder);

    if (args.encoding)
      return core.print.log(zipper.getBuffer().toString(args.encoding));

    const zipName = `${core.workspaceName}.zip`;

    zipper.writeZip(join(core.workspaceFolder, zipName));

    core.print.success("Zip successfully created: %s", zipName);
  },
};
