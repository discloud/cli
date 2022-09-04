import { RESTPutApiAppAllStartResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";

export default new class TeamRestart implements GluegunCommand {
  name = "team:restart";
  description = "Restart one or all of your apps on Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    const id = parameters.first || "all";

    const spin = print.spin({
      text: print.colors.cyan("Starting..."),
    });

    const apiRes = await apidiscloud.put<RESTPutApiAppAllStartResult>(Routes.teamRestart(id), {});

    if (res.status) {
      if (res.status > 399)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${res.data?.message}`));

      if (res.data?.status === "ok") {
        spin.succeed(print.colors.green(`[DISCLOUD API] ${res.data?.message}`));
      } else {
        spin.fail(print.colors.yellow(`[DISCLOUD API] ${res.data?.message}`));
      }

      if (res.data?.apps)
        print.table(Object.entries(res.data.apps).map(([a, b]) => ([a, b.join("\n")])), {
          format: "lean",
        });
    }
  }
};