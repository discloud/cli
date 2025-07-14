import { type RESTPostApiUploadResult, Routes } from "@discloudapp/api-types/v2";
import { DiscloudConfig } from "@discloudapp/util";
import { join } from "path";
import { type ICommand } from "../../interfaces/command";
import { CONFIG_FILENAME } from "../../services/discloud/constants";

interface CommandArgs {
  glob: string[]
}

export default <ICommand<CommandArgs>>{
  name: "upload [glob..]",
  description: "Upload one app or site to Discloud",
  aliases: "up",

  requireAuth: true,

  options: {
    glob: {
      alias: "g",
      type: "array",
      description: "Directories/files with glob pattern to zip",
      default: ["**"],
    },
  },

  async run(core, args) {
    if (!core.fs.exists(CONFIG_FILENAME))
      return core.print.error("%s file is missing.", CONFIG_FILENAME);

    const dConfig = await DiscloudConfig.fromPath(join(core.workspaceFolder, CONFIG_FILENAME));

    await dConfig.validate();

    const spinner = core.print.spin("Zipping files...");

    const arrayBuffer = await core.fs.zip(args.glob, core.workspaceFolder);

    const file = new File(arrayBuffer, "file.zip");

    spinner.start("Uploading...");

    const response = await core.api.post<RESTPostApiUploadResult>(Routes.upload(), { files: [file] });

    core.print.apiResponse(response);

    if (response.status === "ok" && response.app)
      dConfig.update({ AVATAR: response.app.avatarURL, ID: response.app.id });
  },
};
