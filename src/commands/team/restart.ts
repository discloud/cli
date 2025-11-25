import { type RESTPutApiAppAllRestartResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  app: string
}

export default <ICommand<CommandArgs>>{
  name: "restart [app]",
  description: "Restart one or all of your apps on Discloud",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
      default: "all",
    },
  },

  async run(core, args) {
    core.print.spin(`Restarting ${args.app}...`);

    const response = await core.api.put<
      // | RESTPutApiAppRestartResult
      | RESTPutApiAppAllRestartResult
    >(Routes.teamRestart(args.app));

    if (!response.apps) return core.print.apiResponse(response);

    core.print.table(response.apps);
  },
};
