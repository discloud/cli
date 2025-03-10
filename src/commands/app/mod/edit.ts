import { type RESTPutApiAppTeamResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../../interfaces/command";

interface CommandArgs {
  app: string
  mod: string
  perms: string[]
}

export default <CommandInterface<CommandArgs>>{
  name: "edit <app> <mod> [perms...]",
  description: "Edit MOD perms of your app",

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
    },
  },

  async run(core, args) {
    core.print.spin(`Editting MOD ${args.mod} perms to ${args.app}...`);

    const response = await core.api.put<RESTPutApiAppTeamResult>(Routes.appTeam(args.app));

    if (!response.app) return core.print.apiResponse(response);

    core.print.table(response.app);
  },
};
