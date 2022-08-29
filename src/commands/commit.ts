import { RESTPutApiAppCommitResult, Routes } from "@discloudapp/api-types/v2";
import FormData from "form-data";
import { createReadStream } from "fs";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config, resolveArgs } from "../util";

export default new class Commit implements GluegunCommand {
  name = "commit";
  alias = ["c"];
  description = "Commit one app or site to Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    const formData = new FormData();

    let appId: string | undefined;
    let filePath: string | undefined;

    if (parameters.array) {
      const { id, file } = resolveArgs(parameters.array, [{
        name: "file",
        pattern: /\/?\w+\.(zip)/,
      }, {
        name: "id",
        pattern: /[^zip]$/,
      }]);

      appId = id ?? filesystem.read("discloud.config")?.match(/ID=(.+)\r?\n/i)?.[1];
      filePath = file;
    }

    if (!(appId || filePath)) return print.error("Need app id and file path arguments");
    if (!appId) return print.error("Need app id argument");
    if (!filePath) return print.error("Need file path argument");
    if (!filesystem.exists(filePath)) return print.error(`${filePath} does not exists`);

    formData.append("file", createReadStream(filePath));

    const headers = formData.getHeaders({
      "api-token": config.data.token,
    });

    const spin = print.spin({
      text: print.colors.cyan("Commiting..."),
    });

    const res = await apidiscloud.put<RESTPutApiAppCommitResult>(Routes.appCommit(appId), formData, {
      timeout: 300000,
      headers,
    });

    if (res.status) {
      if (res.status > 399)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${res.data?.message}`));

      if (res.data?.status === "ok") {
        spin.succeed(print.colors.green(`[DISCLOUD API] ${res.data?.message}`));
      } else {
        spin.fail(print.colors.yellow(`[DISCLOUD API] ${res.data?.message}`));
      }

      if (res.data?.logs) print.info(`[DISCLOUD API] ${res.data.logs}`);
    }
  }
};