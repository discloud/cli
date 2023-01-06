import { RESTGetApiAppAllResult, RESTPutApiAppAptResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, aptValidator, config, RateLimit } from "../util";
import { Apt, aptKeys } from "../util/constants";

export default new class AppApt implements GluegunCommand {
  name = "app:apt";
  description = "Install or uninstall apt packages for you application.";

  async run(toolbox: GluegunToolbox) {
    const { parameters, print, prompt } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!parameters.first) {
      const spin = print.spin({
        text: print.colors.cyan("Fetching apps..."),
      });

      const apiRes = await apidiscloud.get<RESTGetApiAppAllResult>(Routes.app("all"));

      spin.stop();

      if (apiRes.data)
        if ("apps" in apiRes.data) {
          const { appId } = await prompt.askForApps(apiRes.data.apps);

          parameters.first = appId;
        }

      if (!parameters.first)
        return print.error("Need app id.");
    }

    const methods = <Partial<Record<"delete" | "put", typeof aptKeys>>>{};

    if (parameters.options.i ?? parameters.options.install) {
      methods.put = aptValidator(parameters.options.i ?? parameters.options.install);
    }

    if (parameters.options.u ?? parameters.options.uninstall)
      methods.delete = aptValidator(parameters.options.u ?? parameters.options.uninstall);

    if (methods.put?.length || methods.delete?.length)
      return print.error(
        "You need to use one of the options below:" +
        "\n  -i, --install [PACKAGE]   Install a package." +
        "\n  -u, --uninstall [PACKAGE] Uninstall a package." + "\n" +
        "\nPACKAGES:" + "\n" +
        Object.keys(Apt).map(pkg => `  - ${pkg}: ${Apt[<"tools">pkg]}`).join("\n"),
      );

    const keys = <("delete" | "put")[]>Object.keys(methods);

    for (let i = 0; i < keys.length; i++) {
      const method = keys[i];

      const apt = methods[method];

      let action;
      switch (method) {
        case "delete":
          action = `Uninstalling ${apt} from ${parameters.first} app...`;
          break;
        case "put":
          action = `Installing ${apt} for ${parameters.first} app...`;
          break;
        default:
          action = "";
          break;
      }

      const spin = print.spin({
        text: print.colors.cyan(action),
      });

      const apiRes = await apidiscloud[method]<
        RESTPutApiAppAptResult
      >(Routes.appApt(parameters.first),
        ["delete", "put"].includes(method) ? {
          apt,
        } : undefined);

      new RateLimit(apiRes.headers);

      if (apiRes.status)
        if (print.spinApiRes(apiRes, spin) > 399) return exit(apiRes.status);
    }
  }
};