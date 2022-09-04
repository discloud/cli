import { RESTGetApiAppAllResult, RESTGetApiAppResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";

export default new class Apps implements GluegunCommand {
  name = "apps";
  alias = ["app"];
  description = "Get information of your applications.";

  async run(toolbox: GluegunToolbox) {
    const { print, parameters } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    const id = parameters.first || "all";

    const spin = print.spin({
      text: print.colors.cyan("Fetching apps..."),
    });

    const apiRes = await apidiscloud.get<
      | RESTGetApiAppResult
      | RESTGetApiAppAllResult
    >(Routes.app(id));

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
        for (let i = 0; i < apiRes.data.apps.length; i++) {
          const app = Object.entries(apiRes.data.apps[i]);

          print.table(app.map(a => ([a[0], a[1].join?.("\n") ?? a[1]])), {
            format: "lean",
          });
        }
      } else {
        const app = Object.entries(apiRes.data.apps);

        print.table(app.map(a => ([a[0], a[1].join?.("\n") ?? a[1]])), {
          format: "lean",
        });
      }
    }
  }
};