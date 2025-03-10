import { type RESTPutApiAppConsoleResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../interfaces/command";
import { promptAppConsoleCommand } from "../../prompts/discloud/api";
import { DiscloudAPIError } from "../../services/discloud/errors";
import { tokenIsDiscloudJwt } from "../../services/discloud/utils";

interface CommandArgs {
  app: string
}

export default <CommandInterface<CommandArgs>>{
  name: "console <app>",
  description: "Use the app terminal",
  aliases: "terminal",

  options: {
    app: {
      type: "string",
      description: "App id",
    },
  },

  async run(core, args) {
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
        const response = await core.api.put<RESTPutApiAppConsoleResult>(Routes.appConsole(args.app), {
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

          continue;
        }

        return core.print.error(error);
      }
    }
  },
};
