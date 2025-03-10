import { APTPackages, type RESTDeleteApiAppAptResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../../interfaces/command";

interface CommandArgs {
  app: string
  apt: string[]
}

export default <CommandInterface<CommandArgs>>{
  name: "uninstall <app> [apt...]",
  description: "Uninstall APT from your app",
  aliases: "u",

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
    core.print.spin(`Uninstalling APT ${args.apt} from ${args.app}...`);

    const response = await core.api.delete<RESTDeleteApiAppAptResult>(Routes.appApt(args.app), {
      body: { apt: args.apt.join(",") },
    });

    core.print.apiResponse(response);
  },
};
