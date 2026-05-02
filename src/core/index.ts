import { basename } from "path";
import updateNotifier from "update-notifier";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { version } from "..";
import { type ConfigData } from "../@types";
import { type IApi } from "../interfaces/api";
import { type IBuilder } from "../interfaces/builder";
import { type IFileSystem } from "../interfaces/filesystem";
import { type IPrint } from "../interfaces/print";
import { type IStore } from "../interfaces/store";
import { type ITemplater } from "../interfaces/templater";
import REST from "../services/discloud/REST";
import { UserAgent } from "../services/discloud/UserAgent";
import ConfigStore from "../stores/Config";
import FsJsonStore from "../stores/FsJson";
import YargsBuilder from "../structures/builder/yargs";
import FileSystem from "../structures/filesystem/fs";
import ConsolePrint from "../structures/print/console";
import EjsTemplater from "../structures/templater/ejs";
import { CLI_CONFIG_FILEPATH, CLI_PACKAGE_NAME, DAY_IN_MILLISECONDS } from "../utils/constants";
import { joinWithBuildRoot } from "../utils/path";

export default class Core {
  readonly api: IApi;
  readonly builder: IBuilder;
  readonly config: IStore<ConfigData>;
  readonly fs: IFileSystem;
  readonly print: IPrint;
  readonly templater: ITemplater;

  constructor(readonly argv: string[]) {
    this.#isDebug = process.argv.includes("--debug");

    this.print = new ConsolePrint(this, this.#isDebug);

    this.print.debug("Initializing FileSystem");
    this.fs = new FileSystem(this);
    this.print.debug("Initialized FileSystem");

    this.print.debug("Initializing JSONStore");
    const configStore: IStore<ConfigData> = new FsJsonStore<ConfigData>(CLI_CONFIG_FILEPATH, { encoding: "base64" });
    this.print.debug("Initialized JSONStore");

    this.print.debug("Initializing ConfigStore");
    this.config = new ConfigStore<ConfigData>(configStore);
    this.print.debug("Initialized ConfigStore");

    this.print.debug("Initializing UserAgent");
    const userAgent = new UserAgent(version);
    this.print.debug("Initialized UserAgent");

    this.print.debug("Initializing REST");
    this.api = new REST(this, { userAgent });
    this.print.debug("Initialized REST");

    this.print.debug("Initializing EJS");
    this.templater = new EjsTemplater();
    this.print.debug("Initialized EJS");

    this.print.debug("Initializing Builder");
    const _yargs = yargs(hideBin(argv));

    this.builder = new YargsBuilder(this, _yargs);
    this.print.debug("Initialized Builder");
  }

  readonly #isDebug: boolean;
  get isDebug() { return this.#isDebug; }

  #cwd!: string;
  get workspaceFolder() {
    return this.#cwd ??= process.cwd();
  }

  #workspaceName!: string;
  get workspaceName() {
    return this.#workspaceName ??= basename(this.workspaceFolder);
  }

  #locale!: string;
  get locale(): string {
    return this.#locale ??= Intl.DateTimeFormat().resolvedOptions().locale;
  }

  #loaded!: boolean;
  #loading!: boolean;
  async load() {
    if (this.#loaded || this.#loading) return;
    this.#loading = true;

    this.print.debug("Loading commands...");

    const commandsPath = joinWithBuildRoot("commands");

    await this.builder.load(commandsPath);

    this.#loading = false;
    this.#loaded = true;

    this.print.debug("Loaded commands.");
  }

  async run() {
    if (!this.#loaded && !this.#loading) await this.load();

    updateNotifier({
      pkg: {
        name: CLI_PACKAGE_NAME,
        version,
      },
      updateCheckInterval: DAY_IN_MILLISECONDS,
    }).notify({ defer: false });

    this.print.debug("Running...");
    await this.builder.run();
  }
}
