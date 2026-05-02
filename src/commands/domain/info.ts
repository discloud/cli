import { type RESTGetApiCustomdomainListResult, type RESTGetApiCustomdomainResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  id: string
}

export default <ICommand<CommandArgs>>{
  name: "info",
  description: "Get information of your domains",

  requireAuth: true,

  options: {
    id: {
      type: "string",
      description: "Domain id",
      default: "all",
      alias: ["domain"],
    },
  },

  async run(core, args) {
    core.print.spin(`Fetching ${args.id}...`);

    const response = await core.api.get<
      RESTGetApiCustomdomainResult & RESTGetApiCustomdomainListResult
    >(Routes.customdomain(args.id));

    const data = response.domain ?? response.domains;

    if (!data) return core.print.apiResponse(response);

    core.print.table(data);
  },
};
