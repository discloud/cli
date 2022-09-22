import { RESTGetApiAppAllResult, RESTPutApiAppCommitResult, Routes } from "@discloudapp/api-types/v2";
import FormData from "form-data";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, config, configToObj, getNotIngnoredFiles, makeZipFromFileList, RateLimit, readDiscloudConfig } from "../util";

export default new class Commit implements GluegunCommand {
  name = "commit";
  alias = ["c"];
  description = "Commit one app or site to Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print, prompt } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!parameters.first) parameters.first = ".";
    parameters.first = parameters.first.replace(/(\\|\/)$/, "");

    const dConfig = configToObj(readDiscloudConfig(parameters.first)!);

    if (!parameters.second) {
      const spin = print.spin({
        text: print.colors.cyan("Fetching apps..."),
      });

      const apiRes = await apidiscloud.get<RESTGetApiAppAllResult>(Routes.app("all"));

      spin.stop();

      if (apiRes.data)
        if ("apps" in apiRes.data) {
          const { appId } = await prompt.ask({
            name: "appId",
            message: "Choose the app",
            type: "select",
            choices: apiRes.data.apps.map(app => ({
              name: app.id,
              message: `${app.name} - ${app.id} ${app.id === dConfig.ID ? "[discloud.config]" : ""}`,
              value: app.id,
            })),
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

      parameters.first = await makeZipFromFileList(allFiles);
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