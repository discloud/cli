import { AppLanguages, APT } from "@discloudapp/api-types/v2";
import type { GluegunCommand, GluegunToolbox } from "@discloudapp/gluegun";
import { app_version } from "../util/constants";

export default <GluegunCommand>{
  name: "init",
  description: "Init discloud.config file.",

  async run(toolbox: GluegunToolbox) {
    const { filesystem, parameters, print, prompt, template } = toolbox;

    if (filesystem.exists("discloud.config"))
      return print.error("discloud.config file already exists!");

    if (parameters.options.y)
      return template.generate({
        template: "discloud.config.bot.ejs",
        target: "discloud.config",
        props: { appType: "bot", appAutoRestart: "false", appRam: 100, appVersion: "latest" },
      });

    const { app_apt, appMain, appType, appAutoRestart } = await prompt.ask([
      {
        name: "appType",
        message: "Choose your app type",
        type: "select",
        choices: ["bot", "site"],
      }, {
        name: "appMain",
        message: "Input the path of main file",
        type: "input",
        required: true,
      }, {
        name: "app_apt",
        message: "Choose apt (use space to select)",
        type: "multiselect",
        choices: Object.entries(APT).map(([name, value]) => ({
          name,
          hint: value.join(),
          value: name,
        })),
        initial: 6,
      }, {
        name: "appAutoRestart",
        message: "Auto restart?",
        type: "confirm",
        initial: false,
      },
    ]);

    /** Sorry, it is because app_apt is typed like string, not array */
    const appApt = [...app_apt].join();

    const { appVersion } = await prompt.ask({
      name: "appVersion",
      message: "Choose the version for your app",
      type: "select",
      choices: app_version[<AppLanguages>appMain.split(".").pop()] ?? ["latest"],
      initial: 0,
    });

    const minRam = appType === "site" ? 512 : 100;
    let appRam;
    do {
      if (typeof appRam === "number")
        print.warning(`RAM must to be greater than ${minRam}!`);

      const { app_ram } = await prompt.ask({
        name: "app_ram",
        message: "Input the amount of RAM for your application",
        type: "numeral",
        initial: minRam,
        required: true,
      });

      appRam = parseInt(app_ram);
    } while (appRam < (minRam));

    let appId;
    if (appType === "site") {
      const { app_id } = await prompt.ask({
        name: "app_id",
        message: `Input the ${appType === "site" ? "subdomain" : "app id"}`,
        type: "input",
      });

      appId = app_id.match(appType === "site" ? /(\w+)(?:\.discloud.*)?/ : /(.+)/)?.[1];
    }

    let appName;
    let appAvatar;
    if (appType === "bot") {
      const { app_name } = await prompt.ask({
        name: "app_name",
        message: "App name",
        type: "input",
        required: true,
      });
      appName = app_name;

      do {
        if (appAvatar)
          print.warning("This must be like URL with extensions JPG, JPEG or PNG.");

        const { app_avatar } = await prompt.ask({
          name: "app_avatar",
          message: "Avatar URL",
          type: "input",
        });

        appAvatar = app_avatar;
      } while (appAvatar && !/^(https?:\/\/.+\.(?:jpg|jpeg|png))(?:\?.*)?$/.test(appAvatar));
    }

    template.generate({
      template: `discloud.config.${appType}.ejs`,
      target: "discloud.config",
      props: { appApt, appAvatar, appId, appMain, appName, appRam, appType, appAutoRestart, appVersion },
    });
  },
};