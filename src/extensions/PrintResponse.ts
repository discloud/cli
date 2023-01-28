import { GluegunToolbox } from "@discloudapp/gluegun";
import { exit } from "node:process";

export default function (toolbox: GluegunToolbox) {
  toolbox.print.printApiRes = function (apiRes, options, spin) {
    if (spin) return toolbox.print.spinApiRes(apiRes, spin, options);

    if (typeof apiRes.data === "string") {
      apiRes.data = apiRes.data.match(/<title>(.*)<\/title>/)?.[1] ?? apiRes.data;

      toolbox.print.info(`[DISCLOUD API] ${apiRes.data}`);
    }

    if (apiRes.status > 399) {
      toolbox.print.error(`[DISCLOUD API: ${apiRes.status}] ${apiRes.data?.message ?? apiRes.originalError ?? "fail!"}`);

      return options?.exitOnError ? exit(apiRes.status) : apiRes.status;
    }

    if (apiRes.data)
      if (apiRes.data.status === "ok") {
        toolbox.print.success(`[DISCLOUD API] ${apiRes.data.message ?? apiRes.originalError ?? "success!"}`);
      } else {
        toolbox.print.warning(`[DISCLOUD API] ${apiRes.data.message ?? apiRes.originalError ?? "warn!"}`);
      }

    if (apiRes.problem) {
      toolbox.print.error(`[${apiRes.problem}: ${apiRes.originalError?.errno}] ${apiRes.originalError ?? "fail!"}`);

      return options?.exitOnError ? exit(apiRes.originalError?.errno) : apiRes.originalError?.errno;
    }

    return apiRes.status;
  };
}