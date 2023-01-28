import { RESTGetApiAppAllStatusResult, RESTGetApiAppStatusResult, Routes } from "@discloudapp/api-types/v2";
import type { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import { apidiscloud, config, makeTable, RateLimit } from "../util";

export default <GluegunCommand>{
  name: "status",
  description: "View status information of your applications.",
  alias: ["s", "stats"],

  async run(toolbox: GluegunToolbox) {
    const { print, parameters } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    const id = parameters.first || "all";

    const spin = print.spin({
      text: print.colors.cyan("Fetching apps..."),
    });

    const apiRes = await apidiscloud.get<
      | RESTGetApiAppStatusResult
      | RESTGetApiAppAllStatusResult
    >(Routes.appStatus(id));

    new RateLimit(apiRes.headers);

    print.spinApiRes(apiRes, spin, { exitOnError: true });

    if (!apiRes.data) return;

    if ("apps" in apiRes.data)
      print.table(makeTable(apiRes.data.apps), {
        format: "lean",
      });
  },
};