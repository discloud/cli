import { type RESTGetApiAppAllResult, type RESTGetApiAppResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../interfaces/command";

interface CommandArgs {
  app: string
}

export default <CommandInterface<CommandArgs>>{
  name: "info [app]",
  description: "Get information of your apps",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
      default: "all",
    },
  },

  async run(core, args) {
    const spinner = core.print.spin(`Fetching app${args.app === "all" ? "s" : ""}...`);

    const response = await core.api.get<
      | RESTGetApiAppResult
      | RESTGetApiAppAllResult
    >(Routes.app(args.app));

    spinner.stop();

    if (response.apps) {
      const apps = Array.isArray(response.apps) ? response.apps : [response.apps];
      core.print.table(apps, ["autoDeployGit", "avatarURL", "mainFile", "mods", "name", "type"]);
    } else {
      core.print.apiResponse(response);
    }
  },
};
