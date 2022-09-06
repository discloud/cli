import { RESTGetApiUserResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";

export default new class Login implements GluegunCommand {
  name = "login";
  description = "Login to Discloud API.";

  async run(toolbox: GluegunToolbox) {
    const { print, prompt } = toolbox;

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

    if (apiRes.status) {
      if (print.printApiRes(apiRes) > 399) return;

      if (apiRes.data?.status === "ok")
        config.write({ token });
    }
  }
};