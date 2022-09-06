import { GluegunToolbox } from "gluegun";

export default function (toolbox: GluegunToolbox) {
  return toolbox.print.spinApiRes = function (apiRes, spin) {
    if (typeof apiRes.data === "string")
      spin.info(`[DISCLOUD API] ${apiRes.data}`);

    if (apiRes.status > 399) {
      spin.fail(toolbox.print.colors.red(`[DISCLOUD API] ${apiRes.data?.message ?? "fail!"}`));

      return apiRes.status;
    }

    if (apiRes.data?.status === "ok") {
      spin.succeed(toolbox.print.colors.green(`[DISCLOUD API] ${apiRes.data?.message ?? "success!"}`));
    } else {
      spin.warn(toolbox.print.colors.yellow(`[DISCLOUD API] ${apiRes.data?.message ?? "warn!"}`));
    }

    return apiRes.status;
  };
}