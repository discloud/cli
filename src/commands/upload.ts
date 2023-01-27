import { RESTPostApiUploadResult, Routes } from "@discloudapp/api-types/v2";
import FormData from "form-data";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, arrayOfPathlikeProcessor, config, DiscloudConfig, makeZipFromFileList, RateLimit, verifyRequiredFiles } from "../util";
import { mapDiscloudConfigProps } from "../util/constants";

export default new class Upload implements GluegunCommand {
  name = "upload";
  description = "Upload one app or site to Discloud.";
  alias = ["up", "deploy"];

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print } = toolbox;

    const debug = parameters.options.d || parameters.options.debug;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!parameters.array?.length) parameters.array = ["**"];

    const dConfig = new DiscloudConfig(parameters.array);

    const formData = new FormData();

    if (/\.(zip)$/.test(parameters.array[0])) {
      if (!filesystem.exists(parameters.array[0]))
        return print.error(`${parameters.array[0]} file does not exists.`);
    } else {
      if (typeof dConfig.path !== "string")
        return print.error("discloud.config file is missing.");

      const missing = dConfig.missingProps;

      if (missing.length) {
        const missingProp = mapDiscloudConfigProps[dConfig.data.TYPE]?.[missing[0]] ?? missing[0];

        return print.error(`${missingProp} param is missing from discloud.config`);
      }

      if (!verifyRequiredFiles(parameters.array, dConfig.fileExt, dConfig.data.MAIN)) return;

      const allFiles = dConfig.pushToFileList(arrayOfPathlikeProcessor(parameters.array));
      print.debug(allFiles);
      if (!allFiles.length) return print.error("No files found!");

      parameters.array[0] = await makeZipFromFileList(allFiles, null, debug);
    }

    formData.append("file", filesystem.createReadStream(parameters.array[0]), parameters.array[0]);

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

    new RateLimit(apiRes.headers);

    if (parameters.options.eraseZip !== false)
      filesystem.remove(parameters.array[0]);

    print.spinApiRes(apiRes, spin, { exitOnError: true });

    if (!apiRes.data) return;

    if ("app" in apiRes.data) {
      const app = apiRes.data.app;
      dConfig.update({ ID: app.id, AVATAR: app.avatarURL });

      print.table(Object.entries(app), {
        format: "lean",
      });
    }

    if ("logs" in apiRes.data) print.info(`[DISCLOUD API] ${apiRes.data.logs}`);
  }
};