import { type ApiAppBackup, type ApiAppBackupAll, type RESTGetApiAppAllBackupResult, type RESTGetApiAppBackupResult, Routes } from "@discloudapp/api-types/v2";
import { writeFile } from "fs/promises";
import { join } from "path";
import { type CommandInterface } from "../../interfaces/command";
import { BACKUPS_PATH } from "../../utils/constants";

interface CommandArgs {
  app: string
  path: string
  save: boolean
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
    save: {
      type: "boolean",
      alias: "s",
      description: "Save your app backup",
    },
  },

  async run(core, args) {
    const spinner = core.print.spin(`Fetching your app${args.app === "all" ? "s" : ""} backup...`);

    const response = await core.api.get<
      | RESTGetApiAppBackupResult
      | RESTGetApiAppAllBackupResult
    >(Routes.appBackup(args.app));

    if (!response.backups) return core.print.apiResponse(response);

    if (args.save) {
      if (Array.isArray(response.backups)) {
        for (let i = 0; i < response.backups.length; i++) {
          const backup = response.backups[i];

          spinner.text = `Saving ${i + 1}/${response.backups.length}: ${backup.id}`;

          await getBackup(backup, args.path);
        }
      } else {
        await getBackup(response.backups, args.path);
      }
    }

    const backups = Array.isArray(response.backups) ? response.backups : [response.backups];
    core.print.table(backups);
  },
};

async function getBackup(backup: ApiAppBackup | ApiAppBackupAll, path: string) {
  try {
    const response = await fetch(backup.url);

    if (response.ok) {
      const backupPath = join(path, backup.id);

      await writeFile(backupPath, Buffer.from(await response.arrayBuffer()));

      backup.url = backupPath;
    } else {
      backup.url = `${response.status}: ${response.statusText}`;
    }
  } catch (error: any) {
    backup.url = `[error]: ${error.message}`;
  }
}
