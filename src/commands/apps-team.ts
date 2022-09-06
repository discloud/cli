import { RESTGetApiAppTeamResult, RESTPostApiAppTeamResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config, makeTable } from "../util";
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
      if (print.spinApiRes(apiRes, spin) > 399) return;

      if (!apiRes.data) return;

      if ("app" in apiRes.data)
        print.table(makeTable(apiRes.data.app), {
          format: "lean",
        });

      if ("team" in apiRes.data)
        print.table(makeTable(apiRes.data.team), {
          format: "lean",
        });
    }
  }
};