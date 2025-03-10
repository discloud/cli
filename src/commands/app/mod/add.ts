import { type RESTPostApiAppTeamResult, Routes } from "@discloudapp/api-types/v2";
import { ModPermissionsBF } from "@discloudapp/util";
import { type CommandInterface } from "../../../interfaces/command";

interface CommandArgs {
  app: string
  mod: string
  perms: string[]
}

export default <CommandInterface<CommandArgs>>{
  name: "add <app> <mod> [perms...]",
  description: "Add MOD to your app",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
    },
    mod: {
      type: "string",
      description: "App MOD id",
    },
    perms: {
      type: "array",
      description: "MOD permissions",
      choices: ModPermissionsBF.All.toArray(),
    },
  },

  async run(core, args) {
    core.print.spin(`Adding MOD ${args.mod} to ${args.app}...`);

    const response = await core.api.post<RESTPostApiAppTeamResult>(Routes.appTeam(args.app));

    if (!response.app) return core.print.apiResponse(response);

    core.print.table(response.app);
  },
};
