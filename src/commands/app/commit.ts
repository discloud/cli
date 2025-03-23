import { type RESTPutApiAppCommitResult, Routes } from "@discloudapp/api-types/v2";
import { resolveFile } from "@discloudapp/util";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  app: string
  glob: string[]
}

export default <ICommand<CommandArgs>>{
  name: "commit <app> [glob..]",
  description: "Commit one app or site to Discloud",
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
      default: ["**"],
    },
  },

  async run(core, args) {
    const spinner = core.print.spin("Zipping files...");

    const buffer = await core.fs.zip(args.glob, core.workspaceFolder);

    const file = await resolveFile(buffer);

    spinner.start("Commiting...");

    const response = await core.api.put<RESTPutApiAppCommitResult>(Routes.appCommit(args.app), { files: [file] });

    core.print.apiResponse(response);
  },
};
