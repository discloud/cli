import { type RESTPutApiAppConsoleResult, Routes } from "@discloudapp/api-types/v2";
import MissingRequiredOptionError from "../errors/args";
import { type CommandInterface } from "../interfaces/command";
import { promptAppConsoleCommand } from "../prompts/discloud/api";
import { DiscloudAPIError } from "../services/discloud/errors";
import { tokenIsDiscloudJwt } from "../services/discloud/utils";
import { emitDeprecation } from "../utils/deprecate";

interface CommandArgs {
  _: string[]
  app: string
}

export default <CommandInterface<CommandArgs>>{
  name: "console",
  description: "Use the app terminal",
  aliases: "terminal",

  options: {
    app: {
      type: "string",
      description: "App id",
    },
  },

  async run(core, args) {
    if (!args.app && args._[1]) emitDeprecation("arguments", "app option");

    const appId = args.app ?? args._[1];

    if (!appId) throw new MissingRequiredOptionError("app");

    const token = process.env.DISCLOUD_TOKEN;

    if (typeof token === "string") {
      if (!tokenIsDiscloudJwt(token)) {
        return core.print.error("Please use a valid token");
      }
    } else if (!core.api.hasToken) {
      return core.print.error("Missing Discloud token! Please use login command");
    }

    while (true) {
      const command = await promptAppConsoleCommand();

      if (command === "exit") break;

      const spinner = core.print.spin();

      try {
        const response = await core.api.put<RESTPutApiAppConsoleResult>(Routes.appConsole(appId), {
          body: { command },
          headers: token ? { "api-token": token } : {},
        });

        spinner.stop();

        if (response.status === "ok") {
          if (response.apps?.shell) {
            if (response.apps.shell.stdout)
              core.print.log(response.apps.shell.stdout);

            if (response.apps.shell.stderr)
              core.print.error(response.apps.shell.stderr);
          }
        } else {
          core.print.error(response.message);
        }
      } catch (error) {
        spinner.stop();

        if (error instanceof DiscloudAPIError) {
          switch (error.code) {
            case 401:
              return core.print.error("[Discloud API: %o] Invalid Discloud token", error.code);

            case 404:
              return core.print.error("[Discloud API: %o] App not found on Discloud", error.code);

            case 429:
              return core.print.error("[Discloud API: %o] Rate limited", error.code);

            default:
              core.print.error("[Discloud API: %o] %s", error.code, error.message);
              break;
          }
        }

        return core.print.error(error);
      }
    }
  },
};
