import { RESTPutApiLocaleResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";
import { locales } from "../util/constants";

export default new class Locale implements GluegunCommand {
  name = "locale";
  description = "Set your locale.";

  async run(toolbox: GluegunToolbox) {
    const { print, prompt } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    const { locale } = await prompt.ask({
      name: "locale",
      message: "Choose your locale",
      type: "select",
      choices: locales,
    });

    const apiRes = await apidiscloud.put<RESTPutApiLocaleResult>(Routes.locale(locale), {});

    if (apiRes.status) {
      if (apiRes.status > 399)
        return print.error(`[DISCLOUD API] ${apiRes.data?.message}`);

      if (apiRes.data?.status === "ok") {
        print.success(`[DISCLOUD API] ${apiRes.data?.message ?? "Success!"}`);
      } else {
        print.warning(`[DISCLOUD API] ${apiRes.data?.message}`);
      }
    }
  }
};