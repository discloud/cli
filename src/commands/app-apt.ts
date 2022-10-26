import { RESTGetApiAppAllResult, RESTPutApiAppAptResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, config, RateLimit } from "../util";
import { Apt } from "../util/constants";

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

    let method: "delete" | "put" | undefined;

    if (Object.keys(parameters.options).length)
      method =
        (parameters.options.u ?? parameters.options.uninstall) ? "delete" :
          (parameters.options.i ?? parameters.options.install) ? "put" :
            method;

    if (!method || !Object.keys(Apt).includes(parameters.options[method]))
      return print.error(
        "You need to use one of the options below:" +
        "\n  -i, --install [PACKAGE]   Install a package." +
        "\n  -u, --uninstall [PACKAGE] Uninstall a package." + "\n" +
        "\nPACKAGES:" + "\n" +
        Object.keys(Apt).map(pkg => `  - ${pkg} ${Apt[<"tools">pkg]}`).join("\n"),
      );

    const apt = parameters.options[method];

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
};