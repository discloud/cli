import { type RESTGetApiAppAllResult, type RESTGetApiAppResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  app: string
}

export default <ICommand<CommandArgs>>{
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
    core.print.spin(`Fetching ${args.app}...`);

    const response = await core.api.get<
      | RESTGetApiAppResult
      | RESTGetApiAppAllResult
    >(Routes.app(args.app));

    if (!response.apps) return core.print.apiResponse(response);

    const apps = Array.isArray(response.apps) ? response.apps : [response.apps];
    core.print.table(apps, ["autoDeployGit", "avatarURL", "mainFile", "mods", "name", "type"]);
  },
};
