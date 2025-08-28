import { existsSync } from "fs";
import { basename, dirname, extname, join } from "path";
import { type Argv, type CommandModule } from "yargs";
import type Core from "../../core";
import { type IBuilder } from "../../interfaces/builder";
import { type ICommand } from "../../interfaces/command";
import { DiscloudAPIError } from "../../services/discloud/errors";
import { ERRORS_TO_IGNORE, ERRORS_TO_LOG } from "../../utils/constants";

export default class YargsBuilder implements IBuilder {
  constructor(
    readonly core: Core,
    readonly yargs: Argv,
  ) { }

  async load(path: string) {
    this.yargs
      .alias({
        h: "help",
        v: "version",
      })
      .commandDir(path, { visit: (...args) => this.#resolveCommand(...args) })
      .completion()
      .fail((msg, _err, _yargs) => {
        if (msg) throw msg;
      })
      .help()
      .locale("en") // TODO: multi-locale
      .middleware((args) => {
        if (!args._.length && Object.keys(args).length < 3) this.yargs.showHelp();
      })
      .showHelpOnFail(false)
      .version();
  }

  async run() {
    try {
      await this.yargs.parse();
    } catch (error) {
      if (error instanceof DiscloudAPIError) {
        this.core.print.error(...error.toArray());
        this.yargs.exit(1, error);
      }

      if (error instanceof Error) {
        if (ERRORS_TO_IGNORE.has(error.name)) this.yargs.exit(1, error);

        if (ERRORS_TO_LOG.has(error.name)) {
          this.core.print.error(error.message);
          this.yargs.exit(1, error);
        }

        this.core.print.error(error);
        this.yargs.showVersion((v) => this.core.print.log("discloud -v v%s\nnode -v %s", v, process.version));
        this.yargs.exit(1, error);
      }

      if (error !== undefined && error !== null)
        this.core.print.error(error);

      this.yargs.exit(1, error as Error);
    }
  }

  #resolveCommand(module: any, filePath?: string, filename?: string, parentCommandName?: string) {
    const command: ICommand = module.default ?? module;

    const maybeCommandName = command.name ||= filename && basename(filename, extname(filename));

    if (!maybeCommandName) throw new Error("Missing command name");

    const commandName = maybeCommandName.trim();

    const firstPartCommandName = commandName.split(" ")[0];

    const commandModule = <CommandModule>{
      command: commandName,
      describe: command.description,
      aliases: command.aliases,
      builder: (yargs) => {
        if (filePath) {
          const arg = parentCommandName ? `${parentCommandName} ${firstPartCommandName}` : firstPartCommandName;
          const path = join(dirname(filePath), firstPartCommandName);
          if (existsSync(path)) yargs.commandDir(path, { visit: (...args) => this.#resolveCommand(...args, arg) });
        }

        if (command.options) yargs.options(command.options);

        return yargs;
      },
      handler: (args) => {
        if (typeof command.run !== "function") return this.yargs.showHelp();

        this.yargs.showVersion((message) => args._.length
          ? parentCommandName
            ? this.core.print.writeBoldErr("discloud %s %s v%s", parentCommandName, firstPartCommandName, message)
            : this.core.print.writeBoldErr("discloud %s v%s", firstPartCommandName, message)
          : this.core.print.writeBoldErr("discloud v%s", message));

        if (command.requireAuth) {
          if (!this.core.api.hasToken)
            return this.core.print.error("Missing Discloud token! Please use login command");

          command.checkRateLimit ||= true;
        }

        if (command.checkRateLimit)
          if (this.core.api.isLimited)
            return this.core.print.error("Rate limited until: %s", this.core.api.resetDateString);

        return command.run(this.core, args);
      },
    };

    // fix yargs v18 issue where no command is loaded
    return Object.assign(module, commandModule);
  }
}
