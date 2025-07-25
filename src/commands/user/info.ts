import { type RESTGetApiUserResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs { }

export default <ICommand<CommandArgs>>{
  name: "info",
  description: "Get your information",

  requireAuth: true,

  async run(core, _args) {
    core.print.spin("Fetching user info...");

    const response = await core.api.get<RESTGetApiUserResult>(Routes.user());

    if (!response.user) return core.print.apiResponse(response);

    core.print.table(response.user, ["apps", "avatar", "customdomains", "lastDataLeft", "subdomains"]);
  },
};
