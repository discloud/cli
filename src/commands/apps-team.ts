import { RESTGetApiAppTeamResult, RESTPostApiAppTeamResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";
import { ModPermissions } from "../util/constants";

export default new class AppsTeam implements GluegunCommand {
  name = "apps:team";
  alias = ["app:team"];
  description = "Get team information of your applications.";

  async run(toolbox: GluegunToolbox) {
    const { print, parameters } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (!parameters.first)
      return print.error("Need a param like APP_ID");

    let method: "delete" | "get" | "post" | "put" = "get";

    if (Object.keys(parameters.options).length) 
      method =
        (parameters.options.d || parameters.options.delete) ? "delete" :
          (parameters.options.c || parameters.options.create) ? "post" :
            (parameters.options.e || parameters.options.edit) ? "put" :
              method;

    const perms = (parameters.options.p ?? parameters.options.perms) === "all" ?
      Object.keys(ModPermissions)
      : (parameters.options.p ?? parameters.options.perms ?? "").split(/\W+/);

    const spin = print.spin({
      text: print.colors.cyan("Fetching apps..."),
    });

    const apiRes = await apidiscloud[method]<
      RESTGetApiAppTeamResult & RESTPostApiAppTeamResult
    >(Routes.appTeam(parameters.first, parameters.options.d ?? parameters.options.delete),
      ["post", "put"].includes(method) ? {
        modID: parameters.options.c ?? parameters.options.create ??
          parameters.options.e ?? parameters.options.edit,
        perms,
      } : undefined);

    if (apiRes.status) {
      if (apiRes.status >= 400)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${apiRes.data?.message}`));

      if (apiRes.data?.status === "ok") {
        spin.succeed(print.colors.green(`[DISCLOUD API] ${apiRes.data?.message ?? "Success"}`));
      } else {
        spin.fail(print.colors.yellow(`[DISCLOUD API] ${apiRes.data?.message}`));
      }

      if (!apiRes.data) return;

      if (apiRes.data.app) {
        const app = Object.entries(apiRes.data.app);

        print.table(app.map(a => ([a[0], a[1].join?.("\n") ?? a[1]])), {
          format: "lean",
        });
      }

      if (apiRes.data.team)
        if (Array.isArray(apiRes.data.team)) {
          for (let i = 0; i < apiRes.data.team.length; i++) {
            const app = Object.entries(apiRes.data.team[i]);

            print.table(app.map(a => ([a[0], a[1].join?.("\n") ?? a[1]])), {
              format: "lean",
            });
          }
        }
    }
  }
};