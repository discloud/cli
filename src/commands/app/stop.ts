import { type RESTPutApiAppAllStopResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../interfaces/command";

interface CommandArgs {
  app: string
}

export default <CommandInterface<CommandArgs>>{
  name: "stop [app]",
  description: "Stop one or all of your apps on Discloud",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
      default: "all",
    },
  },

  async run(core, args) {
    core.print.spin(`Stoping ${args.app}...`);

    const response = await core.api.put<
      // | RESTPutApiAppStopResult
      | RESTPutApiAppAllStopResult
    >(Routes.appStop(args.app));

    if (!response.apps) return core.print.apiResponse(response);

    core.print.table(response.apps);
  },
};
