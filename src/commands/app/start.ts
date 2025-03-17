import { type RESTPutApiAppAllStartResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  app: string
}

export default <ICommand<CommandArgs>>{
  name: "start [app]",
  description: "Start one or all of your apps on Discloud",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
      default: "all",
    },
  },

  async run(core, args) {
    core.print.spin(`Starting ${args.app}...`);

    const response = await core.api.put<
      // | RESTPutApiAppStartResult
      | RESTPutApiAppAllStartResult
    >(Routes.appStart(args.app));

    if (!response.apps) return core.print.apiResponse(response);

    core.print.table(response.apps);
  },
};
