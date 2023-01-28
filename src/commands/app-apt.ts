import { APT, APTPackages, RESTPutApiAppAptResult, Routes } from "@discloudapp/api-types/v2";
import type { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import { apidiscloud, aptValidator, config, RateLimit } from "../util";

export default <GluegunCommand>{
  name: "app:apt",
  description: "Install or uninstall apt packages for you application.",
  alias: ["apt"],

  async run(toolbox: GluegunToolbox) {
    const { parameters, print, prompt } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    const methods = <Partial<Record<"delete" | "put", typeof APTPackages>>>{};

    if (parameters.options.i ?? parameters.options.install)
      methods.put = aptValidator(parameters.options.i ?? parameters.options.install);

    if (parameters.options.u ?? parameters.options.uninstall)
      methods.delete = aptValidator(parameters.options.u ?? parameters.options.uninstall);

    if (!(methods.put?.length || methods.delete?.length))
      return print.error(
        "You need to use one of the options below:" +
        "\n  -i, --install [PACKAGE]   Install a package." +
        "\n  -u, --uninstall [PACKAGE] Uninstall a package." + "\n" +
        "\nPACKAGES:" + "\n" +
        APTPackages.map(pkg => `  - ${pkg}: ${APT[pkg]}`).join("\n"),
      );

    if (!parameters.first) {
      const { appId } = await prompt.fetchAndAskForApps();

      if (!appId) return print.error("Need app id.");

      parameters.first = appId;
    }

    const keys = <("delete" | "put")[]>Object.keys(methods);

    for (let i = 0; i < keys.length; i++) {
      const method = keys[i];

      const apt = methods[method]?.join();

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

      print.spinApiRes(apiRes, spin, { exitOnError: true });
    }
  },
};