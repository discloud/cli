import { RESTGetApiAppAllResult, RESTPutApiAppCommitResult, Routes } from "@discloudapp/api-types/v2";
import FormData from "form-data";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, config, getNotIngnoredFiles, makeZipFromFileList, RateLimit } from "../util";

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

    if (!parameters.first) parameters.first = ".";
    parameters.first = parameters.first.replace(/(\\|\/)$/, "");

    if (!parameters.second) {
      const spin = print.spin({
        text: print.colors.cyan("Fetching apps..."),
      });

      const apiRes = await apidiscloud.get<RESTGetApiAppAllResult>(Routes.app("all"));

      spin.stop();

      if (apiRes.data)
        if ("apps" in apiRes.data) {
          const { appId } = await prompt.askForApps(apiRes.data.apps, {
            discloudConfigPath: parameters.first,
          });

          parameters.second = appId;
        }

      if (!parameters.second)
        return print.error("Need app id to commit.");
    }

    const formData = new FormData();

    if (/\.(zip)$/.test(parameters.first)) {
      if (!filesystem.exists(parameters.first))
        return print.error(`${parameters.first} file does not exists.`);
    } else {
      const allFiles = getNotIngnoredFiles(parameters.first);
      if (!allFiles.length) return print.error(`No files found in path ${parameters.first}`);

      parameters.first = await makeZipFromFileList(allFiles, null, debug);
    }

    formData.append("file", filesystem.createReadStream(parameters.first));

    const headers = formData.getHeaders({
      "api-token": config.data.token,
    });

    const spin = print.spin({
      text: print.colors.cyan("Commiting..."),
    });

    const apiRes = await apidiscloud.put<
      RESTPutApiAppCommitResult
    >(Routes.appCommit(parameters.second), formData, {
      timeout: 300000,
      headers,
    });

    new RateLimit(apiRes.headers);

    filesystem.remove(parameters.first);

    if (apiRes.status) {
      if (print.spinApiRes(apiRes, spin) > 399) return exit(apiRes.status);

      if (apiRes.data?.logs) print.info(`[DISCLOUD API] ${apiRes.data.logs}`);
    }
  }
};