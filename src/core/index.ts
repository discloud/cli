import { basename } from "path";
import yargs, { locale } from "yargs";
import { hideBin } from "yargs/helpers";
import { type ConfigData } from "../@types";
import { type ApiInterface } from "../interfaces/api";
import { type BuilderInterface } from "../interfaces/builder";
import { type FileSystemInterface } from "../interfaces/filesystem";
import { type PrintInterface } from "../interfaces/print";
import { type Store } from "../interfaces/store";
import { type Templater } from "../interfaces/templater";
import REST from "../services/discloud/REST";
import { UserAgent } from "../services/discloud/UserAgent";
import ConfigStore from "../stores/Config";
import YargsBuilder from "../structures/builder/yargs";
import FileSystem from "../structures/filesystem/fs";
import ConsolePrint from "../structures/print/console";
import EjsTemplater from "../structures/templater/ejs";
import { joinWithBuildRoot } from "../utils/path";
import { getPackageJSON } from "../utils/utils";

export default class Core {
  readonly api: ApiInterface;
  readonly builder: BuilderInterface;
  readonly config: Store<ConfigData>;
  readonly fs: FileSystemInterface;
  readonly packageJSON: any;
  readonly print: PrintInterface;
  readonly templater: Templater;

  constructor(readonly argv: string[]) {
    this.print = new ConsolePrint(this);

    this.fs = new FileSystem();

    this.config = new ConfigStore();

    this.packageJSON = getPackageJSON();

    const userAgent = new UserAgent(this.packageJSON.version);

    this.api = new REST(this, { userAgent });

    this.templater = new EjsTemplater();

    const _yargs = yargs(hideBin(argv));

    this.builder = new YargsBuilder(this, _yargs);
  }

  #cwd!: string;
  get workspaceFolder() {
    return this.#cwd ??= process.cwd();
  }

  #workspaceName!: string;
  get workspaceName() {
    return this.#workspaceName ??= basename(this.workspaceFolder);
  }

  get locale(): string {
    return locale();
  }

  async run() {
    const commandsPath = joinWithBuildRoot("commands");

    await this.builder.loadCommands(commandsPath);

    await this.builder.run();
  }
}
