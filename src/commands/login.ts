import { type CommandInterface } from "../interfaces/command";
import { promptApiToken } from "../prompts/discloud/api";

interface CommandArgs { }

export default <CommandInterface<CommandArgs>>{
  name: "login",
  description: "Login on Discloud API",

  async run(core, _args) {
    const token = await promptApiToken();

    const apinner = core.print.spin();

    const isValidToken = await core.api.validateToken(token);

    if (isValidToken) {
      core.config.set("token", token);

      return apinner.succeed("Discloud token successfully validated");
    }

    apinner.fail("Invalid Discloud token");
  },
};
