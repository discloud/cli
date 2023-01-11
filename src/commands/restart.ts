import { RESTGetApiAppAllResult, RESTPutApiAppAllRestartResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, config, makeTable, RateLimit } from "../util";

export default new class Restart implements GluegunCommand {
  name = "restart";
  description = "Restart one or all of your apps on Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { parameters, prompt, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!parameters.first) {
      const spin = print.spin({
        text: print.colors.cyan("Fetching apps..."),
      });

      const apiRes = await apidiscloud.get<RESTGetApiAppAllResult>(Routes.app("all"));

      new RateLimit(apiRes.headers);

      spin.stop();

      if (apiRes.data)
        if ("apps" in apiRes.data) {
          const { appId } = await prompt.askForApps(apiRes.data.apps, { all: true });

          parameters.first = appId;
        }

      if (!parameters.first)
        return print.error("Need app id.");
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