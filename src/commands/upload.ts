import { RESTPostApiUploadResult, Routes } from "@discloudapp/api-types/v2";
import FormData from "form-data";
import { createReadStream } from "fs";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";

export default new class Upload implements GluegunCommand {
  name = "upload";
  alias = ["up"];
  description = "Upload one app or site to Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    const formData = new FormData();

    if (parameters.first) {
      if (/\/?\w+\.(zip)/.test(parameters.first)) {
        if (!filesystem.exists(parameters.first))
          return print.error(`${parameters.first} file does not exists.`);
      } else {
        return print.error("File need to be .zip");
      }

      formData.append("file", createReadStream(parameters.first));
    }

    const headers = formData.getHeaders({
      "api-token": config.data.token,
    });

    const spin = print.spin({
      text: print.colors.cyan("Uploading..."),
    });

    const res = await apidiscloud.post<RESTPostApiUploadResult>(Routes.upload(), formData, {
      timeout: 300000,
      headers,
    });

    if (res.status) {
      if (res.status > 399)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${res.data?.message}`));

      spin.succeed(`[DISCLOUD API] ${res.data?.message}`);

      if (res.data?.app)
        print.table(Object.entries(res.data.app), {
          format: "lean",
        });
    }
  }
};