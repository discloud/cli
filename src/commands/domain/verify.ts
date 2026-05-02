import { type RESTGetApiCustomdomainVerifyResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";

interface CommandArgs {
  id: string
}

export default <ICommand<CommandArgs>>{
  name: "verify",
  description: "Verify a domain",

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
    core.print.spin(`Verifying ${args.id}...`);

    const response = await core.api.get<RESTGetApiCustomdomainVerifyResult>(Routes.customdomainVerify(args.id));

    const data = response.domain;

    if (!data) return core.print.apiResponse(response);

    core.print.table(data);
  },
};
