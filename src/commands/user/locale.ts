import { type RESTPutApiLocaleResult, Routes } from "@discloudapp/api-types/v2";
import { type CommandInterface } from "../../interfaces/command";
import { promptUserLocale } from "../../prompts/discloud/api";

interface CommandArgs { }

export default <CommandInterface<CommandArgs>>{
  name: "locale",
  description: "Set your locale",

  requireAuth: true,

  async run(core, _args) {
    const locale = await promptUserLocale();

    core.print.spin("Changing user locale...");

    const response = await core.api.put<RESTPutApiLocaleResult>(Routes.locale(locale));

    core.print.apiResponse(response);
  },
};
