import { RESTGetApiAppAllLogResult, RESTGetApiAppLogResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";

export default new class Logs implements GluegunCommand {
  name = "logs";
  alias = ["l"];
  description = "View the logs from application in Discloud";

  async run(toolbox: GluegunToolbox) {
    const { print, parameters } = toolbox;

    const id = parameters.first || "all";

    if (!config.data.token) return print.error("Please use login command before using this command.");

    const spin = print.spin({
      text: print.colors.cyan("Fetching logs..."),
    });

    const apiRes = await apidiscloud.get<
      | RESTGetApiAppLogResult
      | RESTGetApiAppAllLogResult
    >(Routes.appLogs(id));

    if (apiRes.status) {
      if (apiRes.status >= 400)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${apiRes.data?.message}`));

      spin.succeed(print.colors.green(`[DISCLOUD API] ${apiRes.data?.message}`));

      if (Array.isArray(apiRes.data?.apps)) {
        for (let i = 0; i < (apiRes.data?.apps.length ?? 0); i++) {
          const element = apiRes.data?.apps[i];

          print.info(`${element?.id} ${element?.terminal.url}`);
        }
      } else {
        print.info(`${id} ${apiRes.data?.apps.terminal.url}`);
      }
    }
  }
};