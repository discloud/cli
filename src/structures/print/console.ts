import { type RESTApiBaseResult } from "@discloudapp/api-types/v2";
import Table from "easy-table";
import ora, { type Ora } from "ora";
import { styleText } from "util";
import type Core from "../../core";
import { type IPrint } from "../../interfaces/print";

export default class ConsolePrint implements IPrint {
  constructor(
    readonly core: Core,
  ) {
    if (process.argv.includes("--debug")) this.debug = this.#debug;
  }

  apiResponse(response: RESTApiBaseResult) {
    this.#stopSpin();

    const method: keyof IPrint = response.status === "ok" ? "info" : "warn";

    const additional: unknown[] = [];
    if ("localeList" in response) additional.push("Supported locales:", response.localeList);
    if ("logs" in response) additional.push(response.logs);

    if ("statusCode" in response)
      return this[method]("[Discloud API: %o] %s", response.statusCode, response.message, ...additional);

    this[method]("[Discloud API] %s", response.message, ...additional);
  }

  // #noop() { }

  bold(first: any, ...args: any) {
    this.#stopSpin();

    if (typeof first === "string") return console.log(styleText("bold", first), ...args);
    console.log(first, ...args);
  }

  clear() {
    this.#stopSpin();

    console.clear();
  }

  #debug(first: any, ...args: any) {
    this.#stopSpin();

    const prefix = "[debug]";

    if (typeof first === "string") return console.debug(`%s ${first}`, prefix, ...args);
    console.debug(prefix, first, ...args);
  }

  debug(..._args: any) { }

  error(first: any, ...args: any) {
    this.#stopSpin();

    const prefix = styleText("red", "[error]");

    if (typeof first === "string") return console.error(`%s ${first}`, prefix, ...args);
    console.error(prefix, first, ...args);
  }

  info(first: any, ...args: any) {
    this.#stopSpin();

    const prefix = styleText("blue", "[info]");

    if (typeof first === "string") return console.info(`%s ${first}`, prefix, ...args);
    console.info(prefix, first, ...args);
  }

  log(...args: any) {
    this.#stopSpin();

    console.log(...args);
  }

  #stopSpin() {
    if (this.#spinner?.isSpinning) this.#spinner.stop();
  }

  #spinner!: Ora;
  spin(text?: any) {
    this.#stopSpin();

    return this.#spinner = ora({ text }).start();
  }

  success(first: any, ...args: any): void {
    this.#stopSpin();

    const prefix = styleText("green", "[success]");

    if (typeof first === "string") return console.log(`%s ${first}`, prefix, ...args);
    console.log(prefix, first, ...args);
  }

  table<T>(objOrArray: T, excludeKeys?: any[]) {
    this.#stopSpin();

    resolveTableObj(objOrArray, excludeKeys);

    Table.log(objOrArray);
  }

  warn(first: any, ...args: any): void {
    this.#stopSpin();

    const prefix = styleText("yellow", "[warn]");

    if (typeof first === "string") return console.warn(`%s ${first}`, prefix, ...args);
    console.warn(prefix, first, ...args);
  }

  write(buffer: Uint8Array | string) {
    this.#stopSpin();

    process.stdout.write(buffer);
  }
}

function resolveTableObj(objOrArray: any, excludeKeys: string[] = []) {
  if (Array.isArray(objOrArray)) {
    for (let i = 0; i < objOrArray.length; i++) {
      resolveTableObj(objOrArray[i], excludeKeys);
    }
  } else if (typeof objOrArray === "object" && objOrArray !== null) {
    if (excludeKeys?.length) {
      for (let j = 0; j < excludeKeys.length; j++) {
        Reflect.deleteProperty(objOrArray, excludeKeys[j]);
      }
    }

    const keys = Object.keys(objOrArray);

    for (let j = 0; j < keys.length; j++) {
      const key = keys[j] as keyof typeof objOrArray;
      if (typeof objOrArray[key] === "string") objOrArray[key].replace(/[\r\n]+/g, "");
    }
  }
}
