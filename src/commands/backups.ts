import { RESTGetApiAppAllBackupResult, RESTGetApiAppBackupResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";

export default new class Backup implements GluegunCommand {
  name = "backups";
  alias = ["backup", "bkp", "b"];
  description = "Make backup from your applications in Discloud";

  async run(toolbox: GluegunToolbox) {
    const { print, parameters } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    const id = parameters.first || "all";

    const spin = print.spin({
      text: print.colors.cyan("Fetching backups..."),
    });

    const apiRes = await apidiscloud.get<
      | RESTGetApiAppBackupResult
      | RESTGetApiAppAllBackupResult
    >(Routes.appBackup(id));

    if (apiRes.status) {
      if (apiRes.status >= 400)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${apiRes.data?.message}`));

      if (apiRes.data?.status === "ok") {
        spin.succeed(print.colors.green(`[DISCLOUD API] ${apiRes.data?.message}`));
      } else {
        spin.fail(print.colors.yellow(`[DISCLOUD API] ${apiRes.data?.message}`));
      }

      if (!apiRes.data) return;

      if (Array.isArray(apiRes.data.backups)) {
        const backups = [];

        for (let i = 0; i < apiRes.data.backups.length; i++) {
          const backup = apiRes.data.backups[i];

          backups.push([backup.id, backup.url || backup.status]);
        }

        print.table(backups, {
          format: "lean",
        });
      } else {
        const backup = apiRes.data.backups;

        print.table([[id, backup.url || apiRes.data.status]]);
      }
    }
  }
};