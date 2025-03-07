import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { type ConfigData } from "../@types";
import { type BuilderInterface } from "../interfaces/builder";
import { type PrintInterface } from "../interfaces/print";
import { type Store } from "../interfaces/store";
import { type Templater } from "../interfaces/templater";
import ConfigStore from "../stores/Config";
import YargsBuilder from "../structures/builder/yargs";
import ConsolePrint from "../structures/print/console";
import EjsTemplater from "../structures/templater/ejs";
import { joinWithBuildRoot } from "../utils/path";

export default class Core {
  readonly builder: BuilderInterface;
  readonly config: Store<ConfigData>;
  readonly print: PrintInterface;
  readonly templater: Templater;

  constructor(readonly argv: string[]) {
    this.print = new ConsolePrint(this);

    this.templater = new EjsTemplater();

    this.config = new ConfigStore();

    const _yargs = yargs(hideBin(argv));

    this.builder = new YargsBuilder(this, _yargs);
  }

  async run() {
    const commandsPath = joinWithBuildRoot("commands");

    await this.builder.loadCommands(commandsPath);

    await this.builder.run();
  }
}
