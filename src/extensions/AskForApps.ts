import type { GluegunToolbox } from "gluegun";
import { DiscloudConfig, sortAppsBySameId } from "../util";

export default function (toolbox: GluegunToolbox) {
  toolbox.prompt.askForApps = function (apps, options = {}) {
    options = {
      all: false,
      showStatus: true,
      ...options,
    };

    options.discloudConfig ??= new DiscloudConfig(options.discloudConfigPath);

    return toolbox.prompt.ask({
      name: "appId",
      message: "Choose the app",
      type: "select",
      choices: (options.all ? [{
        name: "all",
        message: "All apps",
        value: "all",
      }] : []).concat(sortAppsBySameId(apps, options.discloudConfig.data.ID!).map(app => ({
        name: app.id,
        message: [
          app.name,
          " - ", app.id,
          options.showStatus ? " - " + (app.online ?
            toolbox.print.colors.green("online") :
            toolbox.print.colors.red("offline")) : undefined,
          "perms" in app ? app.perms.length ?
            ` - [${app.perms.join()}]` : undefined : undefined,
        ].join(""),
        value: app.id,
      }))),
      initial: options.all ? options.discloudConfig.data.ID ? apps.length ? 1 : 0 : 0 : 0,
    });
  };
}