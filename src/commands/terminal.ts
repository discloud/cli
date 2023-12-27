import { GluegunCommand } from "@discloudapp/gluegun";
import { setTimeout as sleep } from "node:timers/promises";
import { RestPutApiTerminalResult } from "../@types";
import { RateLimit, apidiscloud, config } from "../util";
import { tokenIsDiscloudJwt } from "../util/utils";

export default <GluegunCommand>{
  name: "terminal",
  description: "Use the application terminal.",

  async run(toolbox) {
    if (RateLimit.isLimited)
      return toolbox.print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!toolbox.parameters.first) {
      const { appId } = await toolbox.prompt.fetchAndAskForApps();

      if (!appId) return toolbox.print.error("Need app id.");

      toolbox.parameters.first = appId;
    }

    let token = process.env.DISCLOUD_TOKEN;

    if (token && !tokenIsDiscloudJwt(token)) {
      token = config.data.token;
    }

    if (!token)
      return toolbox.print.error("Please use login command before using this command.");

    while (!RateLimit.isLimited) {
      const { command } = await toolbox.prompt.ask({
        name: "command",
        message: ">",
        type: "text",
      });

      if (!command) continue;
      if (command === "exit") break;

      const spin = toolbox.print.spin();

      const apiRes = await apidiscloud.put<RestPutApiTerminalResult>(`/app/${toolbox.parameters.first}/console`, {
        command,
      }, {
        headers: {
          "api-token": token,
        },
      });

      new RateLimit(apiRes.headers);

      spin.stop();
      await sleep(100);

      if (!apiRes.data) break;

      if (apiRes.data.status === "error") {
        if (apiRes.data.message)
          toolbox.print.error(apiRes.data.message);
        continue;
      }

      if (apiRes.data.apps?.shell?.cmd)
        toolbox.print.info(apiRes.data.apps.shell.cmd);
    }

    if (RateLimit.isLimited)
      return toolbox.print.error(`Rate limited until: ${RateLimit.limited}`);
  },
};