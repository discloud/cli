import { RESTPutApiAppCommitResult, Routes } from "@discloudapp/api-types/v2";
import type { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import FormData from "form-data";
import { apidiscloud, arrayOfPathlikeProcessor, config, findDiscloudConfig, makeZipFromFileList, RateLimit } from "../util";

export default <GluegunCommand>{
  name: "team:commit",
  description: "Commit one app for your team.",
  alias: ["team:c"],

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print, prompt } = toolbox;

    const debug = parameters.options.d || parameters.options.debug;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!parameters.array?.length) parameters.array = ["**"];

    const discloudConfigPath = findDiscloudConfig(parameters.array);

    if (!parameters.options.app || typeof parameters.options.app !== "string") {
      const { appId } = await prompt.fetchAndAskForApps({
        all: true,
        discloudConfigPath,
        url: Routes.team(),
      });

      if (!appId)
        return print.error("Need app id to commit.");

      parameters.options.app = appId;
    }

    const formData = new FormData();

    if (/\.(zip)$/.test(parameters.array[0])) {
      if (!filesystem.exists(parameters.array[0]))
        return print.error(`${parameters.array[0]} file does not exists.`);
    } else {
      const allFiles = arrayOfPathlikeProcessor(parameters.array);
      print.debug(allFiles);
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
      >(Routes.teamCommit(parameters.options.app), formData, {
        timeout: 300000,
        headers,
      });

    new RateLimit(apiRes.headers);

    if (parameters.options.eraseZip !== false)
      filesystem.remove(parameters.array[0]);

    print.spinApiRes(apiRes, spin, { exitOnError: true });

    if (!apiRes.data) return;

    if ("logs" in apiRes.data) print.info(`[DISCLOUD API] ${apiRes.data.logs}`);
  },
};