import { RESTPutApiAppAllStartResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";

export default new class Start implements GluegunCommand {
  name = "start";
  description = "Start one or all of your apps on Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    let id;

    if (parameters.first) {
      id = parameters.first;
    } else {
      id = filesystem.read("discloud.config")?.match(/ID=(.+)\r?\n/i)?.[1];

      if (!id) return print.error("Please enter your application id!");
    }

    const res = await apidiscloud.put<RESTPutApiAppAllStartResult>(Routes.appStart(id), {});

    if (res.status) {
      if (res.status > 399)
        return print.error(`[DISCLOUD API] ${res.data?.message}`);

      print.success(`[DISCLOUD API] ${res.data?.message}`);

      if (res.data?.apps)
        print.table(Object.entries(res.data.apps).map(([a, b]) => ([a, b.join("\n")])), {
          format: "lean"
        });
    }
  }
};