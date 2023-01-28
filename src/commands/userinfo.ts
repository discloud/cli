import { RESTGetApiUserResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import { apidiscloud, makeTable, RateLimit } from "../util";

export default <GluegunCommand>{
  name: "userinfo",
  description: "View your Discloud user information.",
  alias: ["ui", "uinfo"],

  async run(toolbox: GluegunToolbox) {
    const { print } = toolbox;

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    const apiRes = await apidiscloud.get<RESTGetApiUserResult>(Routes.user());

    new RateLimit(apiRes.headers);

    print.printApiRes(apiRes, { exitOnError: true });

    if (!apiRes.data) return;

    if ("user" in apiRes.data)
      print.table(makeTable(apiRes.data.user), {
        format: "lean",
      });
  },
};