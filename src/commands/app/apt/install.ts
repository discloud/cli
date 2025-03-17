import { APTPackages, type RESTPutApiAppAptResult, Routes } from "@discloudapp/api-types/v2";
import { type ICommand } from "../../../interfaces/command";

interface CommandArgs {
  app: string
  apt: string[]
}

export default <ICommand<CommandArgs>>{
  name: "install <app> [apt...]",
  description: "Install APT on your app",
  aliases: "i",

  requireAuth: true,

  options: {
    app: {
      type: "string",
      description: "App id",
    },
    apt: {
      type: "array",
      description: "APT",
      choices: APTPackages,
    },
  },

  async run(core, args) {
    core.print.spin(`Installing APT ${args.apt} to ${args.app}...`);

    const response = await core.api.put<RESTPutApiAppAptResult>(Routes.appApt(args.app), {
      body: { apt: args.apt.join(",") },
    });

    core.print.apiResponse(response);
  },
};
