import { RESTGetApiAppAllBackupResult, RESTGetApiAppBackupResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config, makeTable } from "../util";

export default new class TeamBackup implements GluegunCommand {
  name = "team:backups";
  alias = ["team:backup", "team:bkp", "team:b"];
  description = "Make backup from your team applications in Discloud.";

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
    >(Routes.teamBackup(id));

    if (apiRes.status) {
      if (print.spinApiRes(apiRes, spin) > 399) return;

      if (!apiRes.data) return;

      if ("backups" in apiRes.data)
        print.table(makeTable(apiRes.data.backups), {
          format: "lean",
        });
    }
  }
};