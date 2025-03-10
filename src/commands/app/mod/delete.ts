import { type RESTDeleteApiAppTeamResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../../interfaces/command";

interface CommandArgs {
  app: string
  mod: string
}

export default <CommandInterface<CommandArgs>>{
  name: "delete <app> <mod>",
  description: "Delete MOD of your app",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
    },
    mod: {
      type: "string",
      description: "App MOD id",
    },
  },

  async run(core, args) {
    core.print.spin(`Deleting MOD ${args.mod} from ${args.app}...`);

    const response = await core.api.delete<RESTDeleteApiAppTeamResult>(Routes.appTeam(args.app));

    core.print.apiResponse(response);
  },
};
