import { type RESTPostApiCustomdomainCreateResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  id: string
  app: string
}

export default <ICommand<CommandArgs>>{
  name: "create",
  description: "Create a domain",

  requireAuth: true,

  options: {
    id: {
      type: "string",
      description: "Domain id",
      alias: ["domain"],
    },
    app: {
      type: "string",
      description: "Subdomain id",
      default: "all",
      alias: ["subdomain"],
    },
  },

  async run(core, args) {
    core.print.spin(`Creating ${args.id}...`);

    const domain = args.id;
    const appID = args.app;

    const response = await core.api.post<RESTPostApiCustomdomainCreateResult>(Routes.customdomainCreate(), {
      body: {
        appID,
        domain,
      },
    });

    const data = response.domain;

    if (!data) return core.print.apiResponse(response);

    core.print.table(data);
  },
};
