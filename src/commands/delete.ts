import { RESTDeleteApiAppAllDeleteResult, Routes } from "@discloudapp/api-types/v2";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { apidiscloud, config } from "../util";

export default new class Delete implements GluegunCommand {
  name = "delete";
  alias = ["del", "rb"];
  description = "Delete one or all of your apps on Discloud.";

  async run(toolbox: GluegunToolbox) {
    const { parameters, print, prompt } = toolbox;

    if (!config.data.token)
      return print.error("Please use login command before using this command.");

    const { confirmDelete } = await prompt.ask({
      name: "confirmDelete",
      message: `You are ${print.colors.red("DELETING")} your Discloud app. This action is irreversible! Are sure about it?`,
      type: "select",
      choices: ["Yes", "No"],
    });

    if (confirmDelete === "No") return;

    const id = parameters.first || "all";

    const spin = print.spin({
      text: print.colors.cyan("Deleting..."),
    });

    const apiRes = await apidiscloud.delete<RESTDeleteApiAppAllDeleteResult>(Routes.appDelete(id));

    if (apiRes.status) {
      if (apiRes.status > 399)
        return spin.fail(print.colors.red(`[DISCLOUD API] ${apiRes.data?.message}`));

      if (apiRes.data?.status === "ok") {
        spin.succeed(print.colors.green(`[DISCLOUD API] ${apiRes.data?.message}`));
      } else {
        spin.fail(print.colors.yellow(`[DISCLOUD API] ${apiRes.data?.message}`));
      }

      if (apiRes.data?.apps)
        print.table(Object.entries(apiRes.data.apps).map(([a, b]) => ([a, b.join("\n")])), {
          format: "lean",
        });
    }
  }
};