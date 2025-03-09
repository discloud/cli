import { type Argv, type CommandModule } from "yargs";
import type Core from "../../core";
import { type BuilderInterface } from "../../interfaces/builder";
import { type CommandInterface } from "../../interfaces/command";
import { DiscloudAPIError } from "../../services/discloud/errors";
import { ERRORS_TO_IGNORE, ERRORS_TO_LOG } from "../../utils/constants";
export default class YargsBuilder implements BuilderInterface {
  constructor(
    readonly core: Core,
    readonly yargs: Argv,
  ) { }

  async loadCommands(path: string) {
    this.yargs
      .alias({
        h: "help",
        v: "version",
      })
      .commandDir(path, {
        visit: (commandObject, _pathToFile, _filename) => {
          const command: CommandInterface = commandObject.default;

          return <CommandModule>{
            command: command.name,
            describe: command.description,
            aliases: command.aliases,
            builder(yargs: Argv) {
              if (command.options) yargs.options(command.options);
              return yargs;
            },
            handler: (args) => {
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
        },
      })
      .fail(false)
      .help()
      .locale("en") // TODO: multi-locale
      .middleware((args) => {
        this.yargs.showVersion((message) => args._.length
          ? console.log("discloud %s v%s", args._[0], message)
          : console.log("discloud v%s", message));

        if (!args._.length) this.yargs.showHelp();
      })
      .version();
  }

  async run() {
    try {
      await this.yargs.parse();
    } catch (error) {
      if (error instanceof DiscloudAPIError) {
        this.core.print.error(error.toString());
        this.yargs.showVersion((message) => console.log("discloud -v v%s\nnode -v %s", message, process.version));
        this.yargs.exit(1, error);
      }

      if (error instanceof Error) {
        if (ERRORS_TO_IGNORE.has(error.name)) this.yargs.exit(1, error);

        if (ERRORS_TO_LOG.has(error.name)) {
          this.core.print.error("%s", error.message);
          this.yargs.exit(1, error);
        }

        this.core.print.error(error);
        this.yargs.showVersion((message) => console.log("discloud -v v%s\nnode -v %s", message, process.version));
        this.yargs.exit(1, error);
      } else if (error !== undefined && error !== null) {
        this.core.print.error(error);
      }

      this.yargs.exit(1, error as Error);
    }
  }
}
