import { RESTGetApiUserResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, config, makeTable, RateLimit } from "../util";

export default new class UserInfo implements GluegunCommand {
  name = "userinfo";
  description = "See your user info from Discloud";
  alias = ["ui", "uinfo"];

  async run(toolbox: GluegunToolbox) {
    const { print } = toolbox;

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    const apiRes = await apidiscloud.get<RESTGetApiUserResult>(Routes.user(), {}, {
      headers: {
        "api-token": config.data.token,
      },
    });

    new RateLimit(apiRes.headers);

    if (apiRes.status) {
      if (print.printApiRes(apiRes) > 399) return exit(apiRes.status);

      if (apiRes.data?.user)
        print.table(makeTable(apiRes.data.user), {
          format: "lean",
        });
    }
  }
};