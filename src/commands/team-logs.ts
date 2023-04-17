import { RESTGetApiAppAllLogResult, RESTGetApiAppLogResult, Routes } from "@discloudapp/api-types/v2";
import type { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import { RateLimit, apidiscloud, config } from "../util";
import { logsPath } from "../util/constants";

export default <GluegunCommand>{
  name: "team:logs",
  description: "View the logs from team application in Discloud.",
  alias: ["team:l", "team:t", "team:terminal", "team:console", "team:consola"],

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
    >(Routes.teamLogs(id));

    new RateLimit(apiRes.headers);

    print.spinApiRes(apiRes, spin, { exitOnError: true });

    if (!apiRes.data) return;

    if (Array.isArray(apiRes.data.apps)) {
      const terminal = [];

      for (let i = 0; i < apiRes.data.apps.length; i++) {
        const app = apiRes.data.apps[i];

        const terminalParams = [
          "", "-".repeat(60),
          new Date().toString(),
          "",
          app.terminal.big,
        ];

        const uri = `${logsPath}/${app.id}.log`;

        filesystem.append(uri, terminalParams.join("\n"));

        terminal.push([app.id, uri]);
      }

      print.table(terminal, {
        format: "lean",
      });
    } else {
      const terminal = apiRes.data.apps.terminal;

      const terminalParams = [
        "", "-".repeat(60),
        new Date().toString(),
        "",
        terminal.big,
      ];

      const uri = `${logsPath}/${id}.log`;

      filesystem.append(uri, terminalParams.join("\n"));

      print.table([[id, uri]]);
    }
  },
};