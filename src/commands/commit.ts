import { type RESTPostApiUploadResult, Routes } from "@discloudapp/api-types/v2";
import { resolveFile } from "@discloudapp/util";
import MissingRequiredOptionError from "../errors/args";
import { type CommandInterface } from "../interfaces/command";
import { emitDeprecation } from "../utils/deprecate";

interface CommandArgs {
  _: string[]
  app: string
  glob: string[]
}

export default <CommandInterface<CommandArgs>>{
  name: "commit",
  description: "Commit one app or site to Discloud.",
  aliases: "c",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
    },
    glob: {
      alias: "g",
      type: "array",
      description: "Directories/files with glob pattern to zip",
      default: "**",
    },
  },

  async run(core, args) {
    if (!args.app && args._[1]) emitDeprecation("arguments", "app option");

    const appId = args.app ?? args._[1];

    if (!appId) throw new MissingRequiredOptionError("app");

    const spinner = core.print.spin("Zipping files...");

    const buffer = await core.fs.execZip(args.glob, core.workspaceFolder);

    const file = await resolveFile(buffer);

    spinner.text = "Uploading...";

    const response = await core.api.post<RESTPostApiUploadResult>(Routes.appCommit(appId), { files: [file] });

    spinner.stop();

    core.print.apiResponse(response);
  },
};
