import { RESTPostApiUploadResult, Routes } from "@discloudapp/api-types/v2";
import FormData from "form-data";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config, configToObj, getFileExt, getMissingValues, getNotIngnoredFiles, makeZipFromFileList, verifyRequiredFiles } from "../util";
import { requiredDiscloudConfigProps } from "../util/constants";

export default new class Upload implements GluegunCommand {
  name = "upload";
  alias = ["up"];
  description = "Upload one app or site to Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (!parameters.first) return print.error("Need a param like path or file name");

    const formData = new FormData();

    if (/\/?\w+\.(zip)/.test(parameters.first)) {
      if (!filesystem.exists(parameters.first))
        return print.error(`${parameters.first} file does not exists.`);
    } else {
      const fileExt = getFileExt(parameters.first);
      if (fileExt)
        if (!verifyRequiredFiles(parameters.first, fileExt)) return;

      const discloudConfigStr =
        filesystem.read(`${parameters.first}/discloud.config`) ||
        filesystem.read("discloud.config");

      const dConfig = configToObj(discloudConfigStr!);

      const missing = getMissingValues(dConfig, requiredDiscloudConfigProps);

      if (missing.length)
        return print.error(`${missing[0]} param is missing from discloud.config`);

      const allFiles = getNotIngnoredFiles(parameters.first);

      parameters.first = await makeZipFromFileList(allFiles);
    }

    formData.append("file", filesystem.createReadStream(parameters.first), parameters.first);

    const headers = formData.getHeaders({
      "api-token": config.data.token,
    });

    const spin = print.spin({
      text: print.colors.cyan("Uploading..."),
    });

    const apiRes = await apidiscloud.post<RESTPostApiUploadResult>(Routes.upload(), formData, {
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

      if (apiRes.data?.app)
        print.table(Object.entries(apiRes.data.app), {
          format: "lean",
        });

      if (apiRes.data?.logs) print.info(`[DISCLOUD API] ${apiRes.data.logs}`);
    }
  }
};