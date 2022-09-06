import { GluegunToolbox } from "gluegun";

export default function (toolbox: GluegunToolbox) {
  return toolbox.print.printApiRes = function (apiRes) {
    if (typeof apiRes.data === "string")
      toolbox.print.info(`[DISCLOUD API] ${apiRes.data}`);

    if (apiRes.status > 399) {
      toolbox.print.error(`[DISCLOUD API] ${apiRes.data?.message ?? "fail!"}`);

      return apiRes.status;
    }

    if (apiRes.data?.status === "ok") {
      toolbox.print.success(`[DISCLOUD API] ${apiRes.data?.message ?? "success!"}`);
    } else {
      toolbox.print.warning(`[DISCLOUD API] ${apiRes.data?.message ?? "warn!"}`);
    }

    return apiRes.status;
  };
}