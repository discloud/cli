import { RESTGetApiUserResult, Routes } from "@discloudapp/api-types/v2";
import type { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import { apidiscloud, config, RateLimit } from "../util";

export default <GluegunCommand>{
  name: "login",
  description: "Login to Discloud API.",

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

    print.printApiRes(apiRes, { exitOnError: true });

    if (apiRes.data?.status === "ok")
      config.update({ token });
  },
};