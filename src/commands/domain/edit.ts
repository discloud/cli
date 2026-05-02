import { type RESTPutApiCustomdomainEditResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  id: string
  app: string
}

export default <ICommand<CommandArgs>>{
  name: "edit",
  description: "Edit a domain",

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
    core.print.spin(`Editting ${args.id}...`);

    const domain = args.id;
    const newAppID = args.app;

    const response = await core.api.put<RESTPutApiCustomdomainEditResult>(Routes.customdomainEdit(domain), {
      body: {
        newAppID,
      },
    });

    core.print.apiResponse(response);
  },
};
