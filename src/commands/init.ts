import { GluegunCommand, GluegunToolbox } from "gluegun";

export default new class Init implements GluegunCommand {
  name = "init";
  description = "Init discloud.config file.";

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print, prompt, template, } = toolbox;

    if (filesystem.exists("discloud.config"))
      return print.error("discloud.config file already exists!");

    if (parameters.options.y)
      return template.generate({
        template: "discloud.config.ejs",
        target: "discloud.config",
        props: { appType: "bot", appAutoRestart: "false", appRam: 100, appVersion: "latest" }
      });

    const { appId, appMain, appType } = await prompt.ask([{
      name: "appType",
      message: "Choose your app type",
      type: "select",
      choices: ["bot", "site"]
    }, {
      name: "appId",
      message: "Your app id or subdomain",
      type: "input"
    }, {
      name: "appMain",
      message: "Input the path of main file",
      type: "input"
    }]);

    const appAutoRestart = appType === "site";
    const appRam = appType === "bot" ? 100 : 512;
    const appVersion = appType === "bot" ? "latest" : "suja";

    template.generate({
      template: "discloud.config.ejs",
      target: "discloud.config",
      props: { appId, appMain, appType, appAutoRestart, appRam, appVersion }
    });
  }
};