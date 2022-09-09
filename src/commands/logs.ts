import { RESTGetApiAppAllLogResult, RESTGetApiAppLogResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, config, RateLimit } from "../util";
import { logsPath } from "../util/constants";

export default new class Logs implements GluegunCommand {
  name = "logs";
  alias = ["l"];
  description = "View the logs from application in Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, print, parameters } = toolbox;

    if (!config.data.token) return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    const id = parameters.first || "all";

    const spin = print.spin({
      text: print.colors.cyan("Fetching logs..."),
    });

    const apiRes = await apidiscloud.get<
      | RESTGetApiAppLogResult
      | RESTGetApiAppAllLogResult
    >(Routes.appLogs(id));

    new RateLimit(apiRes.headers);

    if (apiRes.status) {
      if (print.spinApiRes(apiRes, spin) > 399) return exit(apiRes.status);

      if (!apiRes.data) return exit(0);

      if (Array.isArray(apiRes.data.apps)) {
        const terminal = [];

        for (let i = 0; i < apiRes.data.apps.length; i++) {
          const app = apiRes.data.apps[i];

          terminal.push([app.id, app.terminal.url]);

          if (parameters.options.save || parameters.options.s) {
            const terminalParams = [
              "", "-".repeat(60),
              new Date().toString(),
              app.terminal.url, "",
              app.terminal.big,
            ];

            filesystem.append(`${logsPath}/${app.id}.log`, terminalParams.join("\n"));

            terminal[i][1] = `${terminal[i][1]}\n${logsPath}/${app.id}.log`;
          }
        }

        print.table(terminal, {
          format: "lean",
        });
      } else {
        const terminal = apiRes.data.apps.terminal;

        if (parameters.options.save || parameters.options.s) {
          const terminalParams = [
            "", "-".repeat(60),
            new Date().toString(),
            terminal.url, "",
            terminal.big,
          ];

          filesystem.append(`${logsPath}/${id}.log`, terminalParams.join("\n"));

          terminal.url = `${terminal.url}\n${logsPath}/${id}.log`;
        }

        print.table([[id, terminal.url]]);
      }
    }

    exit(0);
  }
};