import { DiscloudConfig, RESTPostApiUploadResult, Routes } from "@discloudapp/api-types/v2";
import FormData from "form-data";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { exit } from "node:process";
import { apidiscloud, config, configToObj, configUpdate, getMissingValues, getNotIngnoredFiles, makeZipFromFileList, RateLimit, readDiscloudConfig, verifyRequiredFiles } from "../util";
import { FileExt, mapDiscloudConfigProps, requiredDiscloudConfigProps } from "../util/constants";

export default new class Upload implements GluegunCommand {
  name = "upload";
  alias = ["up"];
  description = "Upload one app or site to Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    if (RateLimit.isLimited)
      return print.error(`Rate limited until: ${RateLimit.limited}`);

    if (!parameters.first) parameters.first = ".";
    parameters.first = parameters.first.replace(/(\\|\/)$/, "");

    const formData = new FormData();

    if (/\.(zip)$/.test(parameters.first)) {
      if (!filesystem.exists(parameters.first))
        return print.error(`${parameters.first} file does not exists.`);
    } else {
      const dConfig = <DiscloudConfig>configToObj<any>(readDiscloudConfig(parameters.first)!);

      const missing = getMissingValues(dConfig, requiredDiscloudConfigProps[dConfig.TYPE]);

      if (missing.length) {
        const missingProp = mapDiscloudConfigProps[dConfig.TYPE]?.[missing[0]] ?? missing[0];

        return print.error(`${missingProp} param is missing from discloud.config`);
      }

      const fileExt = <`${FileExt}`>dConfig.MAIN.split(".").pop();
      if (!verifyRequiredFiles(parameters.first, fileExt, dConfig.MAIN)) return;

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

    new RateLimit(apiRes.headers);

    filesystem.remove(parameters.first);

    if (apiRes.status) {
      if (print.spinApiRes(apiRes, spin) > 399) return exit(apiRes.status);

      if (!apiRes.data) return exit(0);

      if ("app" in apiRes.data) {
        const app = apiRes.data.app;
        configUpdate({ ID: app.id, AVATAR: app.avatarURL });

        print.table(Object.entries(app), {
          format: "lean",
        });
      }

      if (apiRes.data?.logs) print.info(`[DISCLOUD API] ${apiRes.data.logs}`);
    }

    exit(0);
  }
};