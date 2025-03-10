import { type RESTGetApiAppAllStatusResult, type RESTGetApiAppStatusResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../interfaces/command";

interface CommandArgs {
  app: string
}

export default <CommandInterface<CommandArgs>>{
  name: "status [app]",
  description: "Get status of your apps",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
      default: "all",
    },
  },

  async run(core, args) {
    core.print.spin(`Fetching your app${args.app === "all" ? "s" : ""} status...`);

    const response = await core.api.get<
      | RESTGetApiAppStatusResult
      | RESTGetApiAppAllStatusResult
    >(Routes.appStatus(args.app));

    if (!response.apps) return core.print.apiResponse(response);

    const apps = Array.isArray(response.apps) ? response.apps : [response.apps];
    core.print.table(apps, ["netIO"]);
  },
};
