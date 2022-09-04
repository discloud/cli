import { RESTPostApiUploadResult, Routes } from "@discloudapp/api-types/v2";
import FormData from "form-data";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config, configToObj, getMissingValues, getNotIngnoredFiles, makeZipFromFileList } from "../util";
import { requiredDiscloudConfigProps, required_files } from "../util/constants";

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
      for (let i = 0; i < required_files.length; i++)
        if (!filesystem.exists(`${parameters.first}/${required_files[i]}`))
          return print.error(`${required_files[i]} is missing.`);

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

    if (res.status) {
      if (res.status > 399)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${res.data?.message}`));

      if (res.data?.status === "ok") {
        spin.succeed(print.colors.green(`[DISCLOUD API] ${res.data?.message}`));
      } else {
        spin.fail(print.colors.yellow(`[DISCLOUD API] ${res.data?.message}`));
      }

      if (res.data?.app)
        print.table(Object.entries(res.data.app), {
          format: "lean",
        });

      if (res.data?.logs) print.info(`[DISCLOUD API] ${res.data.logs}`);
    }
  }
};