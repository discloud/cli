import { type RESTDeleteApiCustomdomainResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  id: string
}

export default <ICommand<CommandArgs>>{
  name: "delete",
  description: "Delete a domain",

  requireAuth: true,

  options: {
    id: {
      type: "string",
      description: "Domain id",
      alias: ["domain"],
    },
  },

  async run(core, args) {
    core.print.spin(`Deleting ${args.id}...`);

    const domain = args.id;

    const response = await core.api.delete<RESTDeleteApiCustomdomainResult>(Routes.customdomainRemove(domain));

    core.print.apiResponse(response);
  },
};
