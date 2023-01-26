import { RESTPutApiAppAllRestartResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, config, makeTable, RateLimit } from "../util";

export default new class Restart implements GluegunCommand {
  name = "restart";
  description = "Restart one or all of your apps on Discloud.";
  alias = ["r", "reboot", "reset"];

  async run(toolbox: GluegunToolbox) {
    const { parameters, prompt, print } = toolbox;

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
      text: print.colors.cyan("Restarting..."),
    });

    const apiRes = await apidiscloud.put<RESTPutApiAppAllRestartResult>(Routes.appRestart(parameters.first), {});

    new RateLimit(apiRes.headers);

    if (apiRes.status) {
      if (print.spinApiRes(apiRes, spin) > 399) return exit(apiRes.status);

      if (!apiRes.data) return;

      if ("apps" in apiRes.data)
        print.table(makeTable(apiRes.data.apps), {
          format: "lean",
        });
    }
  }
};