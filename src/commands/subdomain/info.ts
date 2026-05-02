import { type RESTGetApiSubdomainListResult, type RESTGetApiSubdomainResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  id: string
}

export default <ICommand<CommandArgs>>{
  name: "info",
  description: "Get information of your subdomains",

  requireAuth: true,

  options: {
    id: {
      type: "string",
      description: "Subdomain id",
      default: "all",
      alias: ["subdomain"],
    },
  },

  async run(core, args) {
    core.print.spin(`Fetching ${args.id}...`);

    const response = await core.api.get<
      RESTGetApiSubdomainResult & RESTGetApiSubdomainListResult
    >(Routes.subdmain(args.id));

    const data = response.subdomain ?? response.subdomains;

    if (!data) return core.print.apiResponse(response);

    core.print.table(data);
  },
};
