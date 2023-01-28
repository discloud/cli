import { RESTDeleteApiAppAllDeleteResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import { apidiscloud, config, makeTable, RateLimit } from "../util";

export default <GluegunCommand>{
  name: "delete",
  description: "Delete one or all of your apps on Discloud.",
  alias: ["del", "rb", "ra", "remover", "remove", "removerbot"],

  async run(toolbox: GluegunToolbox) {
    const { parameters, print, prompt } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!parameters.first) {
      const { appId } = await prompt.fetchAndAskForApps({ all: true });

      if (!appId) return print.error("Need app id.");

      parameters.first = appId;
    }

    const { confirmDelete } = await prompt.ask({
      name: "confirmDelete",
      message: `You are ${print.colors.red("DELETING")} ${parameters.first}. This action is irreversible! Are sure about it?`,
      type: "select",
      choices: ["Yes", "No"],
    });

    if (confirmDelete === "No") return;

    const spin = print.spin({
      text: print.colors.cyan("Deleting..."),
    });

    const apiRes = await apidiscloud.delete<RESTDeleteApiAppAllDeleteResult>(Routes.appDelete(parameters.first));

    new RateLimit(apiRes.headers);

    print.spinApiRes(apiRes, spin, { exitOnError: true });

    if (!apiRes.data) return;

    if ("apps" in apiRes.data)
      print.table(makeTable(apiRes.data.apps), {
        format: "lean",
      });
  },
};