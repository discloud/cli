import { RESTGetApiUserResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, config, RateLimit } from "../util";

export default new class Login implements GluegunCommand {
  name = "login";
  description = "Login to Discloud API.";

  async run(toolbox: GluegunToolbox) {
    const { print, prompt } = toolbox;

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    const { token } = await prompt.ask({
      name: "token",
      message: "Your discloud token:",
      type: "password",
    });

    const apiRes = await apidiscloud.get<RESTGetApiUserResult>(Routes.user(), {}, {
      headers: {
        "api-token": token,
      },
    });

    new RateLimit(apiRes.headers);

    if (apiRes.status) {
      if (print.printApiRes(apiRes) > 399) return exit(apiRes.status);

      if (apiRes.data?.status === "ok")
        config.write({ token });
    }
  }
};