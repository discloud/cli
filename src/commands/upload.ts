import { RESTPostApiUploadResult, Routes } from "@discloudapp/api-types/v2";
import FormData from "form-data";
import { createReadStream } from "fs";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";

export default new class Upload implements GluegunCommand {
  name = "upload";
  description = "Upload one app or site to Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    const formData = new FormData();

    if (parameters.first) {
      if (!filesystem.exists(parameters.first))
        return print.error(`${parameters.first} file does not exists.`);

      formData.append("file", createReadStream(parameters.first));
    }

    const headers = formData.getHeaders({
      "api-token": config.data.token
    });

    const res = await apidiscloud.post<RESTPostApiUploadResult>(Routes.upload(), formData, {
      timeout: 300000,
      headers
    });

    if (res.status) {
      if (res.status > 399)
        return print.error(`[DISCLOUD API] ${res.data?.message}`);

      print.success(`[DISCLOUD API] ${res.data?.message}`);

      if (res.data?.app)
        print.table(Object.entries(res.data.app), {
          format: "lean"
        });
    }
  }
};