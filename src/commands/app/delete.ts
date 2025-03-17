import { type RESTDeleteApiAppAllDeleteResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../interfaces/command";
import { promptConfirm } from "../../prompts/common";

interface CommandArgs {
  app: string
  yes: boolean
}

export default <ICommand<CommandArgs>>{
  name: "delete <app>",
  description: "Delete one or all of your apps on Discloud",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
    },
    yes: {
      type: "boolean",
      description: "Skip confirmation prompt",
      alias: "y",
    },
  },

  async run(core, args) {
    if (!args.yes) {
      const result = await promptConfirm(`You are DELETING ${args.app}. This action is irreversible! Are sure about it?`);
      if (!result) return;
    }

    core.print.spin(`Deleting ${args.app}...`);

    const response = await core.api.delete<RESTDeleteApiAppAllDeleteResult>(Routes.appDelete(args.app));

    core.print.apiResponse(response);
  },
};
