import { type DiscloudConfigScopes } from "@discloudapp/api-types/v2";
import { existsSync } from "fs";
import { type CommandInterface } from "../interfaces/command";
import { promptAppApt, promptAppAutoRestart, promptAppMain, promptAppRam, promptAppType, promptAppVersion } from "../prompts/discloud/config";
import { CONFIG_FILENAME } from "../services/discloud/constants";

interface CommandArgs {
  autorestart?: boolean
  build?: string
  "engine-version"?: string
  main?: string
  name?: string
  ram?: number
  start?: string
  type?: string
  yes?: boolean
}

export default <CommandInterface<CommandArgs>>{
  name: "init",
  description: `Init ${CONFIG_FILENAME} file`,

  options: {
    autorestart: {
      alias: "ar",
      type: "boolean",
      defaultDescription: "false",
      description: "Auto restart switch",
    },
    build: {
      alias: "b",
      type: "string",
      description: "App build",
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
    ram: {
      alias: "r",
      type: "number",
      defaultDescription: "100",
      description: "App RAM (min: 100)",
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
    if (existsSync(CONFIG_FILENAME))
      return core.print.error("%s file already exists!", CONFIG_FILENAME);

    let minRam = args.type === "site" ? 512 : 100;

    const config: Record<DiscloudConfigScopes, unknown> = {
      APT: void 0,
      AUTORESTART: args.autorestart,
      AVATAR: void 0,
      BUILD: args.build,
      ID: void 0,
      MAIN: args.main,
      NAME: args.name,
      RAM: args.ram ? Math.min(args.ram, minRam) : null,
      START: args.start,
      TYPE: args.type,
      VERSION: args["engine-version"],
    };

    if (args.yes) {
      config.AUTORESTART ??= false;
      config.TYPE ??= "bot";
      config.RAM ??= minRam;
      config.VERSION ??= "latest";

      return await core.templater.generate(`${CONFIG_FILENAME}.${config.TYPE}`, CONFIG_FILENAME, config);
    }

    if (!config.TYPE) config.TYPE = await promptAppType();

    if (!config.MAIN) config.MAIN = await promptAppMain();

    if (!config.AUTORESTART) config.AUTORESTART = await promptAppAutoRestart();

    minRam = config.TYPE === "site" ? 512 : 100;

    if (!config.RAM) config.RAM = await promptAppRam(minRam);

    if (!config.APT) config.APT = await promptAppApt().then(v => v.join(","));

    if (!config.VERSION) config.VERSION = await promptAppVersion();

    await core.templater.generate(`${CONFIG_FILENAME}.${config.TYPE}`, CONFIG_FILENAME, config);
  },
};
