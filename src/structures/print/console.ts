import { type RESTApiBaseResult } from "@discloudapp/api-types/v2";
import ora from "ora";
import type Core from "../../core";
import { type PrintInterface } from "../../interfaces/print";

export default class ConsolePrint implements PrintInterface {
  constructor(
    readonly core: Core,
  ) {
    if (process.argv.includes("--debug")) this.debug = this.#debug;
  }

  apiResponse(response: RESTApiBaseResult) {
    const method: keyof PrintInterface = response.status === "ok" ? "info" : "warn";

    this[method]("[DISCLOUD API] %s", response.message);
  }

  // #noop() { }

  #debug(first: string, ...args: any) {
    console.debug(`[debug] ${first}`, ...args);
  }

  debug(..._args: any) { }

  error(first: string, ...args: any) {
    console.error(`[error] ${first}`, ...args);
  }

  info(first: string, ...args: any) {
    console.log(`[info] ${first}`, ...args);
  }

  log(...args: any) {
    console.log(...args);
  }

  spin(text?: string) {
    return ora({ text }).start();
  }

  success(first: string, ...args: any): void {
    console.log(`[success] ${first}`, ...args);
  }

  warn(first: string, ...args: any): void {
    console.warn(`[warn] ${first}`, ...args);
  }
}
