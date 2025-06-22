import { APTPackages, type APTString, type DiscloudConfigScopes } from "@discloudapp/api-types/v2";
import { existsSync } from "fs";
import { type ICommand } from "../interfaces/command";
import { promptAppApt, promptAppAutoRestart, promptAppMain, promptAppRam, promptAppType, promptAppVersion } from "../prompts/discloud/config";
import { CONFIG_FILENAME } from "../services/discloud/constants";

interface CommandArgs {
  apt?: APTString[]
  autorestart?: boolean
  build?: string
  "engine-version"?: string
  main?: string
  name?: string
  overwrite?: boolean
  ram?: number
  start?: string
  type?: string
  yes?: boolean
}

export default <ICommand<CommandArgs>>{
  name: "init",
  description: `Init ${CONFIG_FILENAME} file`,

  options: {
    apt: {
      alias: "a",
      type: "array",
      choices: APTPackages,
      description: "APTs",
    },
    autorestart: {
      alias: "ar",
      type: "boolean",
      defaultDescription: "false",
      description: "Auto restart switch",
    },
    "engine-version": {
      alias: "ev",
      type: "string",
      defaultDescription: "latest",
      description: "App engine version",
    },
    main: {
      alias: "m",
      type: "string",
      description: "App main file",
    },
    name: {
      alias: "n",
      type: "string",
      description: "App name",
    },
    overwrite: {
      alias: "o",
      type: "boolean",
      description: "Overwrite file",
    },
    ram: {
      alias: "r",
      type: "number",
      description: "App RAM (min: 100)",
      defaultDescription: "100",
      coerce(arg) {
        if (arg < 100) return 100;
        return arg;
      },
    },
    start: {
      alias: "s",
      type: "string",
      description: "App start",
    },
    type: {
      alias: "t",
      choices: ["bot", "site"],
      type: "string",
      defaultDescription: "bot",
      description: "App type",
    },
    yes: {
      alias: "y",
      type: "boolean",
      description: "Skip config prompts",
    },
  },

  async run(core, args) {
    if (!args.overwrite && existsSync(CONFIG_FILENAME))
      return core.print.error("%s file already exists!", CONFIG_FILENAME);

    let minRam = args.type === "site" ? 512 : 100;

    const config: Record<DiscloudConfigScopes, unknown> = {
      APT: args.apt,
      AUTORESTART: args.autorestart,
      AVATAR: undefined,
      HOSTNAME: undefined,
      ID: undefined,
      MAIN: args.main,
      NAME: args.name,
      RAM: args.ram ? Math.min(args.ram, minRam) : null,
      START: args.start,
      STORAGE: undefined,
      TYPE: args.type,
      VERSION: args["engine-version"],
      VLAN: undefined,
    };

    if (args.yes) {
      config.AUTORESTART ??= false;
      config.TYPE ??= "bot";
      config.RAM ??= minRam;
      config.VERSION ??= "latest";
      config.VLAN ??= false;

      return await core.templater.generate(`${CONFIG_FILENAME}.${config.TYPE}`, CONFIG_FILENAME, config);
    }

    if (!config.TYPE) config.TYPE = await promptAppType();

    minRam = config.TYPE === "site" ? 512 : 100;

    if (!config.RAM) config.RAM = await promptAppRam(minRam);

    if (!config.MAIN) config.MAIN = await promptAppMain();

    if (!config.APT) config.APT = await promptAppApt().then(v => v.join(","));

    if (!config.VERSION) config.VERSION = await promptAppVersion();

    if (!config.AUTORESTART) config.AUTORESTART = await promptAppAutoRestart();

    await core.templater.generate(`${CONFIG_FILENAME}.${config.TYPE}`, CONFIG_FILENAME, config);
  },
};
