import { GluegunToolbox } from "gluegun";
import { exit } from "node:process";

export default function (toolbox: GluegunToolbox) {
  toolbox.print.spinApiRes = function (apiRes, spin, options) {
    if (!spin) return toolbox.print.printApiRes(apiRes, options);

    if (typeof apiRes.data === "string") {
      apiRes.data = apiRes.data.match(/<title>(.*)<\/title>/)?.[1] ?? apiRes.data;

      spin.info(`[DISCLOUD API] ${apiRes.data}`);
    }

    if (apiRes.status > 399) {
      spin.fail(toolbox.print.colors.red(`[DISCLOUD API: ${apiRes.status}] ${apiRes.data?.message ?? apiRes.originalError ?? "fail!"}`));

      return options?.exitOnError ? exit(apiRes.status) : apiRes.status;
    }

    if (apiRes.data)
      if (apiRes.data.status === "ok") {
        spin.succeed(toolbox.print.colors.green(`[DISCLOUD API] ${apiRes.data.message ?? apiRes.originalError ?? "success!"}`));
      } else {
        spin.warn(toolbox.print.colors.yellow(`[DISCLOUD API] ${apiRes.data.message ?? apiRes.originalError ?? "warn!"}`));
      }

    if (apiRes.problem) {
      spin.fail(`[${apiRes.problem}: ${apiRes.originalError?.errno}] ${apiRes.originalError ?? "fail!"}`);

      return options?.exitOnError ? exit(apiRes.originalError?.errno) : apiRes.originalError?.errno;
    }

    if (spin.isSpinning) spin.stop();

    return apiRes.status;
  };
}