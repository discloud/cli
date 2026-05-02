import { type RESTDeleteApiSubdomainResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  id: string
}

export default <ICommand<CommandArgs>>{
  name: "delete",
  description: "Delete a subdomain",

  requireAuth: true,

  options: {
    id: {
      type: "string",
      description: "Subdomain id",
      alias: ["subdomain"],
    },
  },

  async run(core, args) {
    core.print.spin(`Deleting ${args.id}...`);

    const response = await core.api.delete<RESTDeleteApiSubdomainResult>(Routes.subdmain(args.id));

    core.print.apiResponse(response);
  },
};
