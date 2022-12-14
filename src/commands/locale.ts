import { RESTPutApiLocaleResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config, RateLimit } from "../util";
import { locales } from "../util/constants";

export default new class Locale implements GluegunCommand {
  name = "locale";
  description = "Set your locale.";

  async run(toolbox: GluegunToolbox) {
    const { print, prompt } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    const { locale } = await prompt.ask({
      name: "locale",
      message: "Choose your locale",
      type: "select",
      choices: locales,
    });

    const apiRes = await apidiscloud.put<RESTPutApiLocaleResult>(Routes.locale(locale), {});

    new RateLimit(apiRes.headers);

    if (apiRes.status) 
      print.printApiRes(apiRes);
  }
};