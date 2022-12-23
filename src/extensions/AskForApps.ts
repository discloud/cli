import { GluegunToolbox, print, prompt } from "gluegun";
import { configToObj, readDiscloudConfig, sortAppsBySameId } from "../util";

export default function (toolbox: GluegunToolbox) {
  return toolbox.prompt.askForApps = function (apps, options = {}) {
    options = {
      all: false,
      discloudConfigPath: ".",
      showStatus: true,
      ...options,
    };

    const dConfig = configToObj<string>(readDiscloudConfig(options.discloudConfigPath)!);

    return prompt.ask({
      name: "appId",
      message: "Choose the app",
      type: "select",
      choices: (options.all ? [{
        name: "all",
        message: "All apps",
        value: "all",
      }] : []).concat(sortAppsBySameId(apps, dConfig.ID).map(app => ({
        name: app.id,
        message: [
          app.name,
          " - ", app.id,
          options.showStatus ? " - " + (app.online ?
            print.colors.green("online") :
            print.colors.red("offline")) : undefined,
          "perms" in app ? app.perms.length ?
            ` - [${app.perms.join()}]` : undefined : undefined,
        ].join(""),
        value: app.id,
      }))),
      initial: options.all ? dConfig.ID ? apps.length ? 1 : 0 : 0 : 0,
    });
  };
}