import { type RESTPostApiSubdomainResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  id: string
}

export default <ICommand<CommandArgs>>{
  name: "create",
  description: "Create a subdomain",

  requireAuth: true,

  options: {
    id: {
      type: "string",
      description: "Subdomain id",
      alias: ["subdomain"],
    },
  },

  async run(core, args) {
    core.print.spin(`Creating ${args.id}...`);

    const response = await core.api.post<RESTPostApiSubdomainResult>(Routes.subdmain(args.id));

    const data = response.subdomain;

    if (!data) return core.print.apiResponse(response);

    core.print.table(data);
  },
};
