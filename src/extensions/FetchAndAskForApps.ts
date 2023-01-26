import { RESTGetApiAppAllResult, RESTGetApiTeamResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunToolbox } from "gluegun";
import { apidiscloud, RateLimit } from "../util";

export default function (toolbox: GluegunToolbox) {
  toolbox.prompt.fetchAndAskForApps = async function (options) {
    const spin = toolbox.print.spin({
      text: toolbox.print.colors.cyan("Fetching apps..."),
    });

    const apiRes = await apidiscloud.get<RESTGetApiAppAllResult | RESTGetApiTeamResult>(options?.url ?? Routes.app("all"));

    new RateLimit(apiRes.headers);

    spin.stop();

    if (apiRes.data?.apps)
      return toolbox.prompt.askForApps(apiRes.data.apps, {
        all: options?.all,
        discloudConfig: options?.discloudConfig,
        discloudConfigPath: options?.discloudConfigPath,
        showStatus: options?.showStatus,
      });

    return {};
  };
}