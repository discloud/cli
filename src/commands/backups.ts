import { RESTGetApiAppAllBackupResult, RESTGetApiAppBackupResult, Routes } from "@discloudapp/api-types/v2";
import type { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import axios from "axios";
import { apidiscloud, config, makeTable, RateLimit } from "../util";
import { backupsPath } from "../util/constants";

export default <GluegunCommand>{
  name: "backups",
  description: "Make backup from your applications in Discloud.",
  alias: ["backup", "bkp", "b"],

  async run(toolbox: GluegunToolbox) {
    const { filesystem, print, parameters } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    const id = parameters.first || "all";

    const spin = print.spin({
      text: print.colors.cyan("Fetching backups..."),
    });

    const apiRes = await apidiscloud.get<
      | RESTGetApiAppBackupResult
      | RESTGetApiAppAllBackupResult
    >(Routes.appBackup(id));

    new RateLimit(apiRes.headers);

    print.spinApiRes(apiRes, spin, { exitOnError: true });

    if (!apiRes.data) return;

    if ("backups" in apiRes.data) {
      if (parameters.options.save || parameters.options.s)
        if (Array.isArray(apiRes.data.backups)) {
          for (let i = 0; i < apiRes.data.backups.length; i++) {
            const backup = apiRes.data.backups[i];

            if (backup.status === "ok") {
              const outFileName = `${backupsPath}/${backup.id}.zip`;

              const spin = print.spin({
                text: `Saving: ${outFileName}`,
              });

              try {
                const result = await axios.get(backup.url, { responseType: "arraybuffer" });

                filesystem.write(outFileName, result.data);

                spin.succeed();

                apiRes.data.backups[i].url = outFileName;
              } catch {
                spin.fail();
              }
            }
          }
        } else {
          const backup = apiRes.data.backups;

          const outFileName = `${backupsPath}/${backup.id}.zip`;

          const spin = print.spin({
            text: `Saving: ${outFileName}`,
          });

          try {
            const result = await axios.get(backup.url, { responseType: "arraybuffer" });

            filesystem.write(outFileName, result.data);

            spin.succeed();

            apiRes.data.backups.url = outFileName;
          } catch {
            spin.fail();
          }
        }

      print.table(makeTable(apiRes.data.backups), {
        format: "lean",
      });
    }
  },
};