import { RESTGetApiUserResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud } from "../util";

export default new class Init implements GluegunCommand {
  name = "login";
  description = "Login to Discloud API";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, print, prompt } = toolbox;

    const { token } = await prompt.ask({
      name: "token",
      message: "Your discloud token:",
      type: "password"
    });

    const res = await apidiscloud.get<RESTGetApiUserResult>(Routes.user(), {}, {
      headers: {
        "api-token": token
      }
    });

    if (res.status) {
      if (res.status > 399)
        return print.error(`[DISCLOUD_API] ${res.data?.message}`);

      filesystem.write(`${filesystem.homedir()}/.discloud/api`, token);

      print.success("[DISCLOUD API] Logged!");
    }
  }
};