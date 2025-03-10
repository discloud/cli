import { type RESTGetApiUserResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../interfaces/command";

interface CommandArgs { }

export default <CommandInterface<CommandArgs>>{
  name: "info",
  description: "Get your information",

  requireAuth: true,

  async run(core, _args) {
    core.print.spin("Fetching user info...");

    const response = await core.api.get<RESTGetApiUserResult>(Routes.user());

    if (!response.user) return core.print.apiResponse(response);

    core.print.table([response.user], ["apps", "customdomains", "subdomains"]);
  },
};
