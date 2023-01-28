import { RESTPutApiAppRamResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import { apidiscloud, config, RateLimit } from "../util";

export default new class TeamRam implements GluegunCommand {
  name = "team:ram";
  description = "Set amount of ram for an app of your team.";

  async run(toolbox: GluegunToolbox) {
    const { parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    const appId = parameters.first;
    if (!appId) return print.error("Usage: discloud ram APP_ID RAM_AMOUNT");

    const ram = parameters.second;
    if (!ram) return print.error("Need RAM parameter.");

    const ramInt = parseInt(ram);
    if (isNaN(ramInt)) return print.error("RAM must to be of type integer.");

    if (ramInt < 100) return print.error("RAM must be a value equal to or above 100MB.");

    const spin = print.spin({
      text: print.colors.cyan("Changing amount of RAM..."),
    });

    const apiRes = await apidiscloud.put<RESTPutApiAppRamResult>(Routes.teamRam(appId), {
      ramMB: ramInt,
    });

    new RateLimit(apiRes.headers);

    print.spinApiRes(apiRes, spin);
  }
};