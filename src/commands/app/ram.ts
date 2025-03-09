import { type RESTPutApiAppRamResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../interfaces/command";

interface CommandArgs {
  amount: number
  app: string
}

export default <CommandInterface<CommandArgs>>{
  name: "ram <app> <amount>",
  description: "Set amount of ram for your app",

  requireAuth: true,

  options: {
    amount: {
      type: "number",
      coerce(arg) {
        if (arg >= 100) return arg;
      },
    },
    app: {
      type: "string",
      description: "App id",
    },
  },

  async run(core, args) {
    core.print.spin(`Changing amount of ${args.app} RAM to ${args.amount}...`);

    const response = await core.api.put<RESTPutApiAppRamResult>(Routes.appRam(args.app), {
      body: { ramMB: args.amount },
    });

    core.print.apiResponse(response);
  },
};
