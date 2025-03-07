import { readdirSync } from "fs";
import { extname, join } from "path";
import { type Argv, type CommandModule } from "yargs";
import type Core from "../../core";
import { type BuilderInterface } from "../../interfaces/builder";
import { type CommandInterface } from "../../interfaces/command";
import { ERRORS_TO_IGNORE, ERRORS_TO_LOG, MODULES_EXTENSIONS } from "../../utils/constants";

export default class YargsBuilder implements BuilderInterface {
  constructor(
    readonly core: Core,
    readonly yargs: Argv,
  ) { }

  async loadCommands(path: string) {
    const files = readdirSync(path, { recursive: true, withFileTypes: true });

    const promises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.isFile() || !MODULES_EXTENSIONS.has(extname(file.name))) continue;

      const filePath = join(file.parentPath, file.name);

      promises.push(import(filePath));
    }

    const modules = await Promise.all(promises);

    const commands: CommandModule[] = [];

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];

      const command: CommandInterface = module.default;

      commands.push({
        command: command.name,
        describe: command.description,
        aliases: command.aliases,
        builder(yargs) {
          if (command.options) yargs.options(command.options);
          return yargs;
        },
        handler: (...args) => command.run(this.core, ...args),
      });
    }

    this.yargs
      .alias({
        h: "help",
        v: "version",
      })
      .command(commands)
      .fail(false)
      .help()
      .middleware((args) => {
        this.yargs.showVersion((message) => console.log("discloud %s v%s", args._[0], message));
      }, true)
      .version();
  }

  async run() {
    try {
      await this.yargs.parse();
    } catch (error) {
      if (error instanceof Error) {
        if (ERRORS_TO_IGNORE.has(error.name)) this.yargs.exit(1, error);

        if (ERRORS_TO_LOG.has(error.name)) {
          this.core.print.error("%s: %s", error.name, error.message);
          this.yargs.exit(1, error);
        }

        this.core.print.error(error);
        this.yargs.showVersion((message) => console.log("discloud -v v%s", message));
        console.log("node -v %s", process.version);
        this.yargs.exit(1, error);
      }
    }
  }
}
