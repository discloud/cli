import { RESTPutApiAppAllStopResult, Routes } from "@discloudapp/api-types/v2";
import type { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import { apidiscloud, config, makeTable, RateLimit } from "../util";

export default <GluegunCommand>{
  name: "team:stop",
  description: "Stop one or all of your apps on Discloud.",
  alias: ["team:p"],

  async run(toolbox: GluegunToolbox) {
    const { parameters, print, prompt } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!parameters.first) {
      const { appId } = await prompt.fetchAndAskForApps({
        all: true,
        url: Routes.team(),
      });

      if (!appId) return print.error("Need app id.");

      parameters.first = appId;
    }

    const spin = print.spin({
      text: print.colors.cyan("Stoping..."),
    });

    const apiRes = await apidiscloud.put<RESTPutApiAppAllStopResult>(Routes.teamStop(parameters.first), {});

    new RateLimit(apiRes.headers);

    print.spinApiRes(apiRes, spin, { exitOnError: true });

    if (!apiRes.data) return;

    if ("apps" in apiRes.data)
      print.table(makeTable(apiRes.data.apps), {
        format: "lean",
      });
  },
};