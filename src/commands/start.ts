import { RESTPutApiAppAllStartResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import { apidiscloud, config, makeTable, RateLimit } from "../util";

export default new class Start implements GluegunCommand {
  name = "start";
  description = "Start one or all of your apps on Discloud.";
  alias = ["i"];

  async run(toolbox: GluegunToolbox) {
    const { parameters, print, prompt } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!parameters.first) {
      const { appId } = await prompt.fetchAndAskForApps({ all: true });

      if (!appId) return print.error("Need app id.");

      parameters.first = appId;
    }

    const spin = print.spin({
      text: print.colors.cyan("Starting..."),
    });

    const apiRes = await apidiscloud.put<RESTPutApiAppAllStartResult>(Routes.appStart(parameters.first), {});

    new RateLimit(apiRes.headers);

    print.spinApiRes(apiRes, spin, { exitOnError: true });

    if (!apiRes.data) return;

    if ("apps" in apiRes.data)
      print.table(makeTable(apiRes.data.apps), {
        format: "lean",
      });
  }
};