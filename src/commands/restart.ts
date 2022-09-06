import { RESTPutApiAppAllRestartResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config, makeTable } from "../util";

export default new class Restart implements GluegunCommand {
  name = "restart";
  description = "Restart one or all of your apps on Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    const id = parameters.first || "all";

    const spin = print.spin({
      text: print.colors.cyan("Restarting..."),
    });

    const apiRes = await apidiscloud.put<RESTPutApiAppAllRestartResult>(Routes.appRestart(id), {});

    if (apiRes.status) {
      if (print.spinApiRes(apiRes, spin) > 399) return;

      if (!apiRes.data) return;

      if ("apps" in apiRes.data)
        print.table(makeTable(apiRes.data.apps), {
          format: "lean",
        });
    }
  }
};