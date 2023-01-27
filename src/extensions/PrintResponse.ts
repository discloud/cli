import { GluegunToolbox } from "gluegun";

export default function (toolbox: GluegunToolbox) {
  toolbox.print.printApiRes = function (apiRes, spin) {
    if (spin) return toolbox.print.spinApiRes(apiRes, spin);

    if (typeof apiRes.data === "string") {
      apiRes.data = apiRes.data.match(/<title>(.*)<\/title>/)?.[1] ?? apiRes.data;

      toolbox.print.info(`[DISCLOUD API] ${apiRes.data}`);
    }

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