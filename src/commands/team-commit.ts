import { RESTPutApiAppCommitResult, Routes } from "@discloudapp/api-types/v2";
import FormData from "form-data";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config, configToObj, getNotIngnoredFiles, makeZipFromFileList } from "../util";
import { required_files } from "../util/constants";

export default new class TeamCommit implements GluegunCommand {
  name = "team:commit";
  alias = ["team:c"];
  description = "Commit one app for your team.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (!parameters.first) return print.error("Need a param like path or file name.");

    const formData = new FormData();

    if (/\/?\w+\.(zip)/.test(parameters.first)) {
      if (!filesystem.exists(parameters.first))
        return print.error(`${parameters.first} file does not exists.`);
    } else {
      for (let i = 0; i < required_files.length; i++)
        if (!filesystem.exists(`${parameters.first}/${required_files[i]}`))
          return print.error(`${required_files[i]} is missing.`);

      const discloudConfigStr =
        filesystem.read(`${parameters.first}/discloud.config`) ||
        filesystem.read("discloud.config");

      const dConfig = configToObj(discloudConfigStr!);

      if (!parameters.second) parameters.second = dConfig.ID;
      if (!parameters.second) return print.error("Need app id to commit.");

      const allFiles = getNotIngnoredFiles(parameters.first);

      parameters.first = await makeZipFromFileList(allFiles);
    }

    if (!parameters.second) return print.error("Need app id to commit.");

    formData.append("file", filesystem.createReadStream(parameters.first));

    const headers = formData.getHeaders({
      "api-token": config.data.token,
    });

    const spin = print.spin({
      text: print.colors.cyan("Commiting..."),
    });

    const apiRes = await apidiscloud.put<RESTPutApiAppCommitResult>(Routes.teamCommit(parameters.second), formData, {
      timeout: 300000,
      headers,
    });

    filesystem.remove(parameters.first);

    if (apiRes.status) {
      if (apiRes.status > 399)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${apiRes.data?.message}`));

      if (apiRes.data?.status === "ok") {
        spin.succeed(print.colors.green(`[DISCLOUD API] ${apiRes.data?.message}`));
      } else {
        spin.fail(print.colors.yellow(`[DISCLOUD API] ${apiRes.data?.message}`));
      }

      if (apiRes.data?.logs) print.info(`[DISCLOUD API] ${apiRes.data.logs}`);
    }
  }
};