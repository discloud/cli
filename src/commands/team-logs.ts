import { RESTGetApiAppAllLogResult, RESTGetApiAppLogResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";
import { logsPath } from "../util/constants";

export default new class TeamLogs implements GluegunCommand {
  name = "team:logs";
  alias = ["team:l"];
  description = "View the logs from team application in Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, print, parameters } = toolbox;

    if (!config.data.token) return print.error("Please use login command before using this command.");

    const id = parameters.first || "all";

    const spin = print.spin({
      text: print.colors.cyan("Fetching logs..."),
    });

    const apiRes = await apidiscloud.get<
      | RESTGetApiAppLogResult
      | RESTGetApiAppAllLogResult
    >(Routes.teamLogs(id));

    if (apiRes.status) {
      if (apiRes.status >= 400)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${apiRes.data?.message}`));

      if (apiRes.data?.status === "ok") {
        spin.succeed(print.colors.green(`[DISCLOUD API] ${apiRes.data?.message}`));
      } else {
        spin.fail(print.colors.yellow(`[DISCLOUD API] ${apiRes.data?.message}`));
      }

      if (!apiRes.data) return;

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
  }
};