import { type RESTGetApiAppAllBackupResult, type RESTGetApiAppBackupResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../interfaces/command";
import { BACKUPS_PATH } from "../../utils/constants";

interface CommandArgs {
  app: string
  path: string
}

export default <CommandInterface<CommandArgs>>{
  name: "backup [app] [path]",
  description: "Get backup of your app code from Discloud",
  aliases: "c",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
      default: "all",
    },
    path: {
      type: "string",
      description: "Relative path to backup your app",
      default: BACKUPS_PATH,
    },
  },

  async run(core, args) {
    core.print.spin(`Fetching your app${args.app === "all" ? "s" : ""} backup...`);

    const response = await core.api.get<
      | RESTGetApiAppBackupResult
      | RESTGetApiAppAllBackupResult
    >(Routes.appBackup(args.app));

    if (response.backups) {
      const backups = Array.isArray(response.backups) ? response.backups : [response.backups];
      core.print.table(backups);
    } else {
      core.print.apiResponse(response);
    }
  },
};


