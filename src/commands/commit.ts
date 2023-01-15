import { RESTGetApiAppAllResult, RESTPutApiAppCommitResult, Routes } from "@discloudapp/api-types/v2";
import FormData from "form-data";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, arrayOfPathlikeProcessor, config, DiscloudConfig, makeZipFromFileList, RateLimit } from "../util";

export default new class Commit implements GluegunCommand {
  name = "commit";
  alias = ["c"];
  description = "Commit one app or site to Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print, prompt } = toolbox;

    const debug = parameters.options.d || parameters.options.debug;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!parameters.array?.length) parameters.array = ["**"];

    const discloudConfigPath = DiscloudConfig.findDiscloudConfig(parameters.array);

    if (!parameters.options.app || typeof parameters.options.app !== "string") {
      const spin = print.spin({
        text: print.colors.cyan("Fetching apps..."),
      });

      const apiRes = await apidiscloud.get<RESTGetApiAppAllResult>(Routes.app("all"));

      new RateLimit(apiRes.headers);

      spin.stop();

      if (apiRes.data)
        if ("apps" in apiRes.data) {
          const { appId } = await prompt.askForApps(apiRes.data.apps, { discloudConfigPath });

          parameters.options.app = appId;
        }

      if (!parameters.options.app)
        return print.error("Need app id to commit.");
    }

    const formData = new FormData();

    if (/\.(zip)$/.test(parameters.array[0])) {
      if (!filesystem.exists(parameters.array[0]))
        return print.error(`${parameters.array[0]} file does not exists.`);
    } else {
      const allFiles = arrayOfPathlikeProcessor(parameters.array);
      if (!allFiles.length) return print.error("No files found!");

      parameters.array[0] = await makeZipFromFileList(allFiles, null, debug);
    }

    formData.append("file", filesystem.createReadStream(parameters.array[0]));

    const headers = formData.getHeaders({
      "api-token": config.data.token,
    });

    const spin = print.spin({
      text: print.colors.cyan("Commiting..."),
    });

    const apiRes = await apidiscloud.put<
      RESTPutApiAppCommitResult
      >(Routes.appCommit(parameters.options.app), formData, {
        timeout: 300000,
        headers,
      });

    new RateLimit(apiRes.headers);

    if (!parameters.options["no-erase-zip"])
      filesystem.remove(parameters.array[0]);

    if (apiRes.status) {
      if (print.spinApiRes(apiRes, spin) > 399) return exit(apiRes.status);

      if (apiRes.data?.logs) print.info(`[DISCLOUD API] ${apiRes.data.logs}`);
    }
  }
};