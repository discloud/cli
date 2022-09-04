import { RESTPutApiAppAllStartResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";

export default new class Start implements GluegunCommand {
  name = "start";
  alias = ["i"];
  description = "Start one or all of your apps on Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    const id = parameters.first || "all";

    const spin = print.spin({
      text: print.colors.cyan("Starting..."),
    });

    const apiRes = await apidiscloud.put<RESTPutApiAppAllStartResult>(Routes.appStart(id), {});

    if (apiRes.status) {
      if (apiRes.status > 399)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${apiRes.data?.message}`));

      if (apiRes.data?.status === "ok") {
        spin.succeed(print.colors.green(`[DISCLOUD API] ${apiRes.data?.message}`));
      } else {
        spin.fail(print.colors.yellow(`[DISCLOUD API] ${apiRes.data?.message}`));
      }

      if (apiRes.data?.apps)
        print.table(Object.entries(apiRes.data.apps).map(([a, b]) => ([a, b.join("\n")])), {
          format: "lean",
        });
    }
  }
};