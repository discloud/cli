import { RESTPutApiAppAllStopResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, config, makeTable, RateLimit } from "../util";

export default new class TeamStop implements GluegunCommand {
  name = "team:stop";
  description = "Stop one or all of your apps on Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    const id = parameters.first || "all";

    const spin = print.spin({
      text: print.colors.cyan("Stoping..."),
    });

    const apiRes = await apidiscloud.put<RESTPutApiAppAllStopResult>(Routes.teamStop(id), {});

    new RateLimit(apiRes.headers);

    if (apiRes.status) {
      if (print.spinApiRes(apiRes, spin) > 399) return exit(apiRes.status);

      if (!apiRes.data) return exit(0);

      if ("apps" in apiRes.data)
        print.table(makeTable(apiRes.data.apps), {
          format: "lean",
        });
    }

    exit(0);
  }
};