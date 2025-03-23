import { type ICommand } from "../interfaces/command";
import { type IZip } from "../interfaces/zip";
import Zip from "../structures/filesystem/zip";

interface CommandArgs {
  encoding?: BufferEncoding
  glob: string[]
  out: string
}

export default <ICommand<CommandArgs>>{
  name: "zip [glob..]",
  description: "Make zip",

  options: {
    encoding: {
      alias: "e",
      type: "string",
      choices: ["base64", "base64url", "hex"] as BufferEncoding[],
      description: "Response encoding (This option doesn't create the zip file)",
      conflicts: "out",
    },
    glob: {
      alias: "g",
      type: "array",
      description: "Directories/files with glob pattern to zip",
      default: ["**"],
    },
    out: {
      alias: "o",
      type: "string",
      conflicts: "encoding",
      defaultDescription: "folder_name.zip",
    },
  },

  async run(core, args) {
    const spinner = core.print.spin("Searching files...");

    const files = await core.fs.glob(args.glob);

    core.print.debug("Found %o files:", files.length, files);

    spinner.start(`Adding ${files.length} files...`);

    const zipper: IZip = new Zip();

    await zipper.appendFiles(files, core.workspaceFolder);

    core.print.debug("Added %o files", zipper.fileCount);

    if (args.encoding) {
      spinner.start("Getting zip buffer...");
      const buffer = await zipper.getBuffer();
      return core.print.write(buffer.toString(args.encoding));
    }

    spinner.start("Writting zip file...");

    args.out ??= (core.workspaceName || "file") + ".zip";

    await zipper.writeZip(args.out);

    spinner.succeed(`Zip successfully created: ${args.out}`);
  },
};
