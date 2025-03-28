import { type RESTGetApiTeamResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs { }

export default <ICommand<CommandArgs>>{
  name: "info",
  description: "Get info of your team apps",

  requireAuth: true,

  async run(core, _args) {
    core.print.spin("Fetching team info...");

    const response = await core.api.get<RESTGetApiTeamResult>(Routes.team());

    if (!response.apps) return core.print.apiResponse(response);

    core.print.table(response.apps, ["perms"]);
  },
};
