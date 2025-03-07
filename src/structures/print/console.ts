import type Core from "../../core";
import { type PrintInterface } from "../../interfaces/print";

export default class ConsolePrint implements PrintInterface {
  constructor(
    readonly core: Core,
  ) {
    if (process.argv.includes("--debug")) this.debug = this.#debug;
  }

  // #noop() { }

  #debug(...args: any) {
    console.debug(...args);
  }

  debug(..._args: any) { }

  error(...args: any) {
    console.error(...args);
  }

  info(...args: any) {
    console.log(...args);
  }

  log(...args: any) {
    console.log(...args);
  }

  success(...args: any): void {
    console.log(...args);
  }

  warn(...args: any): void {
    console.warn(...args);
  }
}
