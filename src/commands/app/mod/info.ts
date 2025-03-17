import { type RESTGetApiAppTeamResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../../interfaces/command";

interface CommandArgs {
  app: string
}

export default <ICommand<CommandArgs>>{
  name: "info <app>",
  description: "Get MOD info of your app",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
    },
  },

  async run(core, args) {
    core.print.spin(`Fetching ${args.app} mod info...`);

    const response = await core.api.get<RESTGetApiAppTeamResult>(Routes.appTeam(args.app));

    if (!response.team?.length) return core.print.apiResponse(response);

    core.print.table(response.team);
  },
};
