import { type RESTGetApiAppStatusResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  app: string
}

export default <ICommand<CommandArgs>>{
  name: "status <app>",
  description: "Get status of your team app",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
    },
  },

  async run(core, args) {
    core.print.spin(`Fetching ${args.app} status...`);

    const response = await core.api.get<RESTGetApiAppStatusResult>(Routes.teamStatus(args.app));

    if (!response.apps) return core.print.apiResponse(response);

    core.print.table([response.apps], ["netIO"]);
  },
};
