import { type RESTGetApiTeamResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../interfaces/command";

interface CommandArgs { }

export default <CommandInterface<CommandArgs>>{
  name: "info",
  description: "Get info of team apps",

  async run(core, _args) {
    const spinner = core.print.spin("Fetching user info...");

    const response = await core.api.get<RESTGetApiTeamResult>(Routes.team());

    spinner.stop();

    if (response.apps) {
      core.print.table(response.apps, ["apps", "customdomains", "subdomains"]);
    } else {
      core.print.apiResponse(response);
    }
  },
};
