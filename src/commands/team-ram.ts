import { RESTPutApiAppRamResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";

export default new class TeamRam implements GluegunCommand {
  name = "team:ram";
  description = "Set amount of ram for an app of your team.";

  async run(toolbox: GluegunToolbox) {
    const { parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

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

    const res = await apidiscloud.put<RESTPutApiAppRamResult>(Routes.teamRam(appId), {
      ramMB: ramInt,
    });

    if (res.status) {
      if (res.status > 399)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${res.data?.message}`));

      if (res.data?.status === "ok") {
        spin.succeed(print.colors.green(`[DISCLOUD API] ${res.data?.message}`));
      } else {
        spin.warn(print.colors.yellow(`[DISCLOUD API] ${res.data?.message}`));
      }
    }
  }
};