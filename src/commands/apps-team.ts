import { RESTGetApiAppTeamResult, RESTPostApiAppTeamResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, config, makeTable, RateLimit } from "../util";
import { ModPermissions } from "../util/constants";

export default new class AppsTeam implements GluegunCommand {
  name = "apps:team";
  description = "Get team information of your applications.";
  alias = ["app:team"];

  async run(toolbox: GluegunToolbox) {
    const { parameters, print, prompt } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!parameters.first)
      return print.error("Need a param like APP_ID");

    let method: "delete" | "get" | "post" | "put" = "get";

    if (Object.keys(parameters.options).length) 
      method =
        (parameters.options.d ?? parameters.options.delete) ? "delete" :
          (parameters.options.c ?? parameters.options.create) ? "post" :
            (parameters.options.e ?? parameters.options.edit) ? "put" :
              method;

    let perms = parameters.options.p ?? parameters.options.perms;
    if (["post", "put"].includes(method))
      if (!perms) {
        const { permissions } = await prompt.ask({
          name: "permissions",
          message: "Choose the permissions",
          type: "multiselect",
          choices: Object.keys(ModPermissions),
        });

        perms = permissions;
      }

    if (typeof perms === "string")
      perms = perms === "all" ?
        Object.keys(ModPermissions) :
        (parameters.options.p ?? parameters.options.perms ?? "").split(/\W+/);

    let modID;
    let action;
    switch (method) {
      case "delete":
        action = `Deleting ${modID} MOD from ${parameters.first} app...`;
        break;
      case "post":
        modID = parameters.options.c ?? parameters.options.create;
        action = `Creating ${modID} MOD with ${perms.length} permissions for ${parameters.first} app...` +
          `${perms.length ? `\nPermissions: ${perms.join(", ")}` : ""}`;
        break;
      case "put":
        modID = parameters.options.e ?? parameters.options.edit;
        action = `Updating ${modID} MOD with ${perms.length} permissions for ${parameters.first} app...` +
          `${perms.length ? `\nPermissions: ${perms.join(", ")}` : ""}`;
        break;
      default:
        action = "Fetching apps...";
        break;
    }

    const spin = print.spin({
      text: print.colors.cyan(action),
    });

    const apiRes = await apidiscloud[method]<
      RESTGetApiAppTeamResult & RESTPostApiAppTeamResult
      >(Routes.appTeam(parameters.first, parameters.options.d ?? parameters.options.delete),
        ["post", "put"].includes(method) ? {
          modID,
          perms,
        } : undefined);

    new RateLimit(apiRes.headers);

    if (apiRes.status) {
      if (print.spinApiRes(apiRes, spin) > 399) return exit(apiRes.status);

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